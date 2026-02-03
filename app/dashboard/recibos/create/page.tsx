"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/contexts/dashboard-context";
import type { ReceiptItem } from "@/types/receipt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PriceInput } from "@/components/ui/price-input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LuArrowLeft, LuPlus, LuTrash2, LuSearch, LuSettings } from "react-icons/lu";
import Link from "next/link";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";

const paymentMethods = ["Efectivo", "Transferencia Debito", "Transferencia Credito", "Otro"];

const emptyForm = {
  paymentMethod: "",
  commissionRate: 0,
  notes: "",
};

function newItem(): ReceiptItem {
  return {
    id: crypto.randomUUID(),
    productId: "",
    name: "",
    quantity: 1,
    unitPrice: 0,
    lineTotal: 0,
  };
}

export default function CreateReceiptPage() {
  const router = useRouter();
  const { addReceipt, products, commissions, updateCommissions, getCommissionRate } = useDashboard();
  const [form, setForm] = useState(emptyForm);
  const [formItems, setFormItems] = useState<ReceiptItem[]>([newItem()]);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const subtotal = formItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const commissionAmount = subtotal * (form.commissionRate / 100);
  const total = subtotal + commissionAmount;

  function updateItem(id: string, field: keyof ReceiptItem, value: string | number) {
    setFormItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        updated.lineTotal = updated.quantity * updated.unitPrice;
        return updated;
      })
    );
  }

  function removeItem(id: string) {
    setFormItems((prev) => (prev.length <= 1 ? prev : prev.filter((i) => i.id !== id)));
  }

  function addItem() {
    setFormItems((prev) => [...prev, newItem()]);
  }

  function selectProduct(itemId: string, product: Product) {
    setFormItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const updated = {
          ...item,
          productId: product.id,
          name: product.name,
          unitPrice: product.price,
          lineTotal: item.quantity * product.price,
        };
        return updated;
      })
    );
    setSearchId(null);
    setSearchQuery("");
  }

  const filteredProducts = products.filter(
    (p) =>
      p.active &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  async function handleSave() {
    if (!form.paymentMethod) return;
    if (formItems.every((i) => !i.productId)) return;

    const validItems = formItems.filter((i) => i.productId);
    const sub = validItems.reduce((s, i) => s + i.lineTotal, 0);
    const comm = sub * (form.commissionRate / 100);

    setSaving(true);
    await addReceipt({
      status: "pendiente",
      paymentMethod: form.paymentMethod,
      subtotal: sub,
      commissionRate: form.commissionRate,
      commissionAmount: comm,
      total: sub + comm,
      notes: form.notes,
      items: validItems,
    });
    setSaving(false);

    router.push("/dashboard/recibos");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/recibos">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <LuArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-neutral-900">
          Nuevo recibo
        </h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Payment method */}
        <div className="space-y-2">
          <Label>Método de pago *</Label>
          <Select
            value={form.paymentMethod}
            onValueChange={(v) =>
              setForm((f) => ({
                ...f,
                paymentMethod: v,
                commissionRate: getCommissionRate(v),
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Items */}
        <div className="space-y-2">
          <Label>Ítems</Label>
          <div className="space-y-2">
            {formItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_80px_100px_100px_36px] items-center gap-2"
              >
                <div className="relative">
                  <div className="relative">
                    <LuSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                    <Input
                      placeholder="Buscar producto..."
                      value={searchId === item.id ? searchQuery : item.name}
                      onFocus={() => {
                        setSearchId(item.id);
                        setSearchQuery(item.name);
                      }}
                      onChange={(e) => {
                        setSearchId(item.id);
                        setSearchQuery(e.target.value);
                        updateItem(item.id, "name", e.target.value);
                      }}
                      onBlur={() => {
                        setTimeout(() => setSearchId(null), 150);
                      }}
                      className="pl-8"
                    />
                  </div>
                  {searchId === item.id && searchQuery && filteredProducts.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-neutral-200 bg-white shadow-md">
                      <ul className="max-h-48 overflow-y-auto py-1">
                        {filteredProducts.slice(0, 8).map((p) => (
                          <li key={p.id}>
                            <button
                              type="button"
                              className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-neutral-50"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                selectProduct(item.id, p);
                              }}
                            >
                              <span className="text-neutral-900">{p.name}</span>
                              <span className="text-neutral-500">${formatPrice(p.price)}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <Input
                  type="number"
                  min={1}
                  placeholder="Cant."
                  value={item.quantity || ""}
                  onChange={(e) =>
                    updateItem(
                      item.id,
                      "quantity",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
                <PriceInput
                  placeholder="P. unitario"
                  value={item.unitPrice}
                  onChange={(val) => updateItem(item.id, "unitPrice", val)}
                />
                <span className="text-right text-sm font-medium text-neutral-700">
                  ${formatPrice(item.lineTotal)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-500 hover:text-red-600"
                  onClick={() => removeItem(item.id)}
                >
                  <LuTrash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
          >
            <LuPlus className="mr-1.5 h-4 w-4" />
            Agregar ítem
          </Button>
        </div>

        {/* Commission rate */}
        <div className="space-y-2">
          <Label htmlFor="commissionRate">Tasa de comisión (%)</Label>
          <Input
            id="commissionRate"
            type="number"
            min={0}
            step={0.1}
            value={form.commissionRate || ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                commissionRate: parseFloat(e.target.value) || 0,
              }))
            }
            placeholder="0"
          />
          <Link href="/dashboard/configuracion/comisiones">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1"
            >
              <LuSettings className="mr-1.5 h-4 w-4" />
              Administrar comisiones
            </Button>
          </Link>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) =>
              setForm((f) => ({ ...f, notes: e.target.value }))
            }
            placeholder="Notas adicionales"
            rows={2}
          />
        </div>

        {/* Summary */}
        <Separator />
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">Subtotal</span>
            <span className="font-medium">${formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">
              Comisión ({form.commissionRate}%)
            </span>
            <span className="font-medium">
              ${formatPrice(commissionAmount)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>${formatPrice(total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Crear recibo"}
          </Button>
          <Link href="/dashboard/recibos">
            <Button variant="outline">Cancelar</Button>
          </Link>
        </div>
      </div>

    </div>
  );
}
