"use client";

import { useParams } from "next/navigation";
import { useDashboard } from "@/contexts/dashboard-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LuArrowLeft } from "react-icons/lu";
import Link from "next/link";

export default function ReceiptDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { getReceipt } = useDashboard();
  const receipt = getReceipt(id);

  if (!receipt) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/recibos">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <LuArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-neutral-900">
            Recibo no encontrado
          </h1>
        </div>
        <p className="text-sm text-neutral-500">
          El recibo que buscas no existe.
        </p>
      </div>
    );
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
          Recibo {receipt.receiptNumber}
        </h1>
      </div>

      <div className="w-full space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-neutral-500">Fecha</span>
            <p className="font-medium">
              {receipt.createdAt.toLocaleDateString("es-AR")}
            </p>
          </div>
          <div>
            <span className="text-neutral-500">Método de pago</span>
            <p className="font-medium">{receipt.paymentMethod}</p>
          </div>
          <div>
            <span className="text-neutral-500">Estado</span>
            <p>
              <Badge
                variant={
                  receipt.status === "pagado"
                    ? "default"
                    : receipt.status === "anulado"
                      ? "destructive"
                      : "secondary"
                }
              >
                {receipt.status.charAt(0).toUpperCase() +
                  receipt.status.slice(1)}
              </Badge>
            </p>
          </div>
        </div>

        <Separator />

        {/* Items table */}
        <div>
          <span className="text-neutral-500">Ítems</span>
          <div className="mt-1 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Cant.</TableHead>
                  <TableHead className="text-right">P. unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipt.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.unitPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${item.lineTotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-neutral-500">Subtotal</span>
            <span className="font-medium">
              ${receipt.subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">
              Comisión ({receipt.commissionRate}%)
            </span>
            <span className="font-medium">
              ${receipt.commissionAmount.toFixed(2)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>${receipt.total.toFixed(2)}</span>
          </div>
        </div>

        {receipt.notes && (
          <>
            <Separator />
            <div>
              <span className="text-neutral-500">Notas</span>
              <p className="mt-1">{receipt.notes}</p>
            </div>
          </>
        )}

        <div className="pt-2">
          <Link href="/dashboard/recibos">
            <Button variant="outline">Volver</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
