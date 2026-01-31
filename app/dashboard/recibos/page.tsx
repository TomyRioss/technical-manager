"use client";

import { useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/contexts/dashboard-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LuPlus, LuTrash2, LuSearch, LuEye } from "react-icons/lu";

export default function RecibosPage() {
  const { receipts, deleteReceipt } = useDashboard();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = receipts.filter(
    (r) =>
      r.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.paymentMethod.toLowerCase().includes(search.toLowerCase())
  );

  function handleDelete(id: string) {
    deleteReceipt(id);
    setDeletingId(null);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900">Recibos</h1>
        <Link href="/dashboard/recibos/create">
          <Button size="sm">
            <LuPlus className="mr-1.5 h-4 w-4" />
            Nuevo recibo
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Buscar por número, método de pago..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500">
          {receipts.length === 0
            ? "No hay recibos. Creá uno para empezar."
            : "No se encontraron resultados."}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nro</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Método de pago</TableHead>
                <TableHead className="text-right">Ítems</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Comisión</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">
                    {receipt.receiptNumber}
                  </TableCell>
                  <TableCell className="text-neutral-500">
                    {receipt.createdAt.toLocaleDateString("es-AR")}
                  </TableCell>
                  <TableCell>{receipt.paymentMethod}</TableCell>
                  <TableCell className="text-right">
                    {receipt.items.length}
                  </TableCell>
                  <TableCell className="text-right">
                    ${receipt.subtotal.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-neutral-500">
                    ${receipt.commissionAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${receipt.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/dashboard/recibos/${receipt.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <LuEye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {deletingId === receipt.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="destructive"
                            size="xs"
                            onClick={() => handleDelete(receipt.id)}
                          >
                            Sí
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => setDeletingId(null)}
                          >
                            No
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-500 hover:text-red-600"
                          onClick={() => setDeletingId(receipt.id)}
                        >
                          <LuTrash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
