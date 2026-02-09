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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { LuPlus, LuTrash2, LuSearch, LuEye, LuLoader, LuArchiveX } from "react-icons/lu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatPrice } from "@/lib/utils";
import type { Receipt } from "@/types/receipt";

export default function RecibosPage() {
  const { receipts, archivedReceipts, deleteReceipt, archiveReceipt, loading } = useDashboard();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  function filterReceipts(list: Receipt[]) {
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (r) =>
        r.receiptNumber.toLowerCase().includes(q) ||
        r.paymentMethod.toLowerCase().includes(q)
    );
  }

  const filteredActive = filterReceipts(receipts);
  const filteredArchived = filterReceipts(archivedReceipts);

  function handleDelete(id: string) {
    deleteReceipt(id);
    setDeletingId(null);
  }

  function handleArchive(id: string) {
    archiveReceipt(id);
    setArchivingId(null);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
        <LuLoader className="h-6 w-6 animate-spin mb-2" />
        <span className="text-sm">Cargando datos...</span>
      </div>
    );
  }

  function renderTable(list: Receipt[], showArchiveBtn: boolean) {
    if (list.length === 0) {
      return (
        <div className="rounded-md border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500">
          {search
            ? "No se encontraron resultados."
            : showArchiveBtn
              ? "No hay recibos. Creá uno para empezar."
              : "No hay recibos archivados."}
        </div>
      );
    }

    return (
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
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((receipt) => (
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
                  ${formatPrice(receipt.subtotal)}
                </TableCell>
                <TableCell className="text-right text-neutral-500">
                  -${formatPrice(receipt.commissionAmount)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${formatPrice(receipt.total)}
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
                  <TooltipProvider delayDuration={300}>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={`/dashboard/recibos/${receipt.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <LuEye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>Detalles</TooltipContent>
                      </Tooltip>
                      {showArchiveBtn && (
                        archivingId === receipt.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="default"
                              size="xs"
                              onClick={() => handleArchive(receipt.id)}
                            >
                              Sí
                            </Button>
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => setArchivingId(null)}
                            >
                              No
                            </Button>
                          </div>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-neutral-500 hover:text-amber-600"
                                onClick={() => { setArchivingId(receipt.id); setDeletingId(null); }}
                              >
                                <LuArchiveX className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Archivar</TooltipContent>
                          </Tooltip>
                        )
                      )}
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-neutral-500 hover:text-red-600"
                              onClick={() => { setDeletingId(receipt.id); setArchivingId(null); }}
                            >
                              <LuTrash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Eliminar</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
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

      {/* Tabs */}
      <Tabs defaultValue="recientes">
        <TabsList>
          <TabsTrigger value="recientes">
            Recientes ({receipts.length})
          </TabsTrigger>
          <TabsTrigger value="archivadas">
            Archivadas ({archivedReceipts.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="recientes" className="mt-4">
          {renderTable(filteredActive, true)}
        </TabsContent>
        <TabsContent value="archivadas" className="mt-4">
          {renderTable(filteredArchived, false)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
