"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDashboard } from "@/contexts/dashboard-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LuArrowLeft, LuTrash2, LuLoader } from "react-icons/lu";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

const PAYMENT_METHODS = [
  "Efectivo",
  "Transferencia Debito",
  "Transferencia Credito",
  "Otro",
];

type EditableItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export default function EditQuotePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { getReceipt } = useDashboard();
  const receipt = getReceipt(id);

  const [initialized, setInitialized] = useState(false);
  const [items, setItems] = useState<EditableItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [commissionRate, setCommissionRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState("");

  if (receipt && !initialized) {
    setItems(
      receipt.items.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      }))
    );
    setPaymentMethod(receipt.paymentMethod);
    setCommissionRate(receipt.commissionRate);
    setNotes(receipt.notes || "");
    setInitialized(true);
  }

  if (!receipt) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/recibos?tab=presupuestos">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <LuArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-neutral-900">Presupuesto no encontrado</h1>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const commissionAmount = subtotal * commissionRate / 100;
  const total = subtotal - commissionAmount;
  const busy = saving || confirming || rejecting;

  function updateItem(id: string, field: "quantity" | "unitPrice", value: number) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleSave() {
    setError("");
    setSaving(true);
    const res = await fetch(`/api/receipts/${receipt!.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethod, commissionRate, notes, items }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Error al guardar los cambios.");
      return;
    }
    router.push("/dashboard/recibos?tab=presupuestos");
  }

  async function handleConfirm() {
    setError("");
    setConfirming(true);
    const saveRes = await fetch(`/api/receipts/${receipt!.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethod, commissionRate, notes, items }),
    });
    if (!saveRes.ok) {
      const data = await saveRes.json().catch(() => ({}));
      setError(data.error || "Error al guardar los cambios.");
      setConfirming(false);
      return;
    }
    const confirmRes = await fetch(`/api/receipts/${receipt!.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    setConfirming(false);
    if (!confirmRes.ok) {
      const data = await confirmRes.json().catch(() => ({}));
      setError(data.error || "Error al confirmar el presupuesto.");
      return;
    }
    router.push("/dashboard/recibos?tab=presupuestos");
  }

  async function handleReject() {
    setError("");
    setRejecting(true);
    const res = await fetch(`/api/receipts/${receipt!.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    setRejecting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Error al rechazar el presupuesto.");
      return;
    }
    router.push("/dashboard/recibos?tab=presupuestos");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/recibos?tab=presupuestos">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <LuArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-neutral-900">
          Presupuesto {receipt.receiptNumber}
        </h1>
      </div>

      <div className="space-y-5 text-sm max-w-2xl">
        {/* Items */}
        <div>
          <Label className="text-neutral-500 mb-2 block">Ítems</Label>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right w-24">Cant.</TableHead>
                  <TableHead className="text-right w-32">P. unit.</TableHead>
                  <TableHead className="text-right w-28">Total</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                        className="h-7 w-20 text-right ml-auto"
                        disabled={busy}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                        className="h-7 w-28 text-right ml-auto"
                        disabled={busy}
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${formatPrice(item.quantity * item.unitPrice)}
                    </TableCell>
                    <TableCell>
                      {items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-neutral-400 hover:text-red-600"
                          onClick={() => removeItem(item.id)}
                          disabled={busy}
                        >
                          <LuTrash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <Separator />

        {/* Payment method & commission */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-neutral-500">Método de pago</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={busy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-neutral-500">Comisión (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
              disabled={busy}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-neutral-500">Notas</Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas opcionales..."
            disabled={busy}
          />
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-neutral-500">Subtotal</span>
            <span className="font-medium">${formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Comisión ({commissionRate}%)</span>
            <span className="font-medium">-${formatPrice(commissionAmount)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>${formatPrice(total)}</span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 font-medium">{error}</p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <Button variant="destructive" size="sm" onClick={handleReject} disabled={busy}>
            {rejecting && <LuLoader className="h-4 w-4 animate-spin mr-1" />}
            Rechazar
          </Button>
          <div className="flex gap-2">
            <Link href="/dashboard/recibos?tab=presupuestos">
              <Button variant="outline" size="sm" disabled={busy}>Cancelar</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={busy}>
              {saving && <LuLoader className="h-4 w-4 animate-spin mr-1" />}
              Guardar cambios
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleConfirm}
              disabled={busy}
            >
              {confirming && <LuLoader className="h-4 w-4 animate-spin mr-1" />}
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
