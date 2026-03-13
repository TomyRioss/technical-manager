"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import { LuPlus, LuTrash2, LuSearch, LuEye, LuLoader, LuArchiveX, LuPrinter, LuChevronLeft, LuCheck, LuX, LuPencil } from "react-icons/lu";
import { ReceiptImportDialog } from "@/components/receipts/receipt-import-dialog";
import { ReceiptPrintModal } from "@/components/receipts/receipt-print-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatPrice } from "@/lib/utils";
import { useStorePlan } from "@/hooks/use-store-plan";
import type { Receipt } from "@/types/receipt";

export default function RecibosPage() {
  const { receipts, archivedReceipts, deleteReceipt, archiveReceipt, loading, storeId, storeName, branchName } = useDashboard();
  const { isReadOnly } = useStorePlan();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [printingReceipt, setPrintingReceipt] = useState<Receipt | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const defaultTab = searchParams.get("tab") === "presupuestos" ? "presupuestos" : "recibos";
  const [activeTab, setActiveTab] = useState<"recibos" | "presupuestos">(defaultTab as "recibos" | "presupuestos");

  const quotes = receipts.filter(
    (r) => r.receiptNumber.startsWith("PRE-") && r.status === "pendiente"
  );
  const activeReceipts = receipts.filter(
    (r) => !(r.receiptNumber.startsWith("PRE-") && r.status === "pendiente")
  );

  async function handleConfirmQuote(id: string) {
    setActionLoading(id);
    const res = await fetch(`/api/receipts/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    setActionLoading(null);
    setConfirmingId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Error al confirmar el presupuesto.");
      return;
    }
    window.location.reload();
  }

  async function handleCancelQuote(id: string) {
    setActionLoading(id);
    const res = await fetch(`/api/receipts/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    setActionLoading(null);
    setCancelingId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Error al cancelar el presupuesto.");
      return;
    }
    window.location.reload();
  }

  function filterReceipts(list: Receipt[]) {
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (r) =>
        r.receiptNumber.toLowerCase().includes(q) ||
        r.paymentMethod.toLowerCase().includes(q)
    );
  }

  const filteredActive = filterReceipts(activeReceipts);
  const filteredArchived = filterReceipts(archivedReceipts);
  const filteredQuotes = filterReceipts(quotes);

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
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nro</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
              <TableHead className="hidden md:table-cell">Método de pago</TableHead>
              <TableHead className="text-right hidden md:table-cell">Ítems</TableHead>
              <TableHead className="text-right hidden md:table-cell">Subtotal</TableHead>
              <TableHead className="text-right hidden md:table-cell">Comisión</TableHead>
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
                  <div className="md:hidden text-xs text-neutral-400 mt-0.5">
                    {receipt.paymentMethod} · {receipt.createdAt.toLocaleDateString("es-AR")}
                  </div>
                </TableCell>
                <TableCell className="text-neutral-500 hidden md:table-cell">
                  {receipt.createdAt.toLocaleDateString("es-AR")}
                </TableCell>
                <TableCell className="hidden md:table-cell">{receipt.paymentMethod}</TableCell>
                <TableCell className="text-right hidden md:table-cell">
                  {receipt.items.length}
                </TableCell>
                <TableCell className="text-right hidden md:table-cell">
                  ${formatPrice(receipt.subtotal)}
                </TableCell>
                <TableCell className="text-right text-neutral-500 hidden md:table-cell">
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPrintingReceipt(receipt)}
                          >
                            <LuPrinter className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Imprimir</TooltipContent>
                      </Tooltip>
                      {showArchiveBtn && (
                        archivingId === receipt.id ? (
                          <div className="flex flex-wrap items-center gap-1">
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
                                disabled={isReadOnly}
                              >
                                <LuArchiveX className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Archivar</TooltipContent>
                          </Tooltip>
                        )
                      )}
                      {deletingId === receipt.id ? (
                        <div className="flex flex-wrap items-center gap-1">
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
                              disabled={isReadOnly}
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
      {/* Search */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="relative w-full sm:w-auto sm:max-w-sm sm:flex-1">
          <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Buscar por número, método de pago..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <ReceiptImportDialog open={importOpen} onOpenChange={setImportOpen} />

      {printingReceipt && (
        <ReceiptPrintModal
          open
          onClose={() => setPrintingReceipt(null)}
          receipt={printingReceipt}
          storeName={storeName}
          branchName={branchName}
          storeId={storeId}
        />
      )}

      {/* Tab pills + acciones */}
      <div className="flex flex-wrap items-center gap-1 border-b pb-2">
        <button
          onClick={() => setActiveTab("recibos")}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeTab === "recibos" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
        >
          Recibos
        </button>
        <button
          onClick={() => setActiveTab("presupuestos")}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeTab === "presupuestos" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
        >
          Presupuestos
        </button>
        <div className="ml-auto flex items-center gap-1">
          {activeTab === "presupuestos" ? (
            <Link href="/dashboard/recibos/create?type=presupuesto" className={isReadOnly ? "pointer-events-none" : ""}>
              <Button size="sm" disabled={isReadOnly}>
                <LuPlus className="mr-1.5 h-4 w-4" />
                Nuevo presupuesto
              </Button>
            </Link>
          ) : (
            <>
              {!isReadOnly && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setShowImport((v) => !v)}>
                    <LuChevronLeft className="h-4 w-4" />
                  </Button>
                  {showImport && (
                    <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                      Importar CSV
                    </Button>
                  )}
                </>
              )}
              <Link href="/dashboard/recibos/create" className={isReadOnly ? "pointer-events-none" : ""}>
                <Button size="sm" disabled={isReadOnly}>
                  <LuPlus className="mr-1.5 h-4 w-4" />
                  Nuevo recibo
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Contenido */}
      {activeTab === "recibos" && (
        <div className="mt-4">
          {renderTable(filteredActive, true)}
        </div>
      )}
      {activeTab === "presupuestos" && (
        <div className="mt-4">
          {filteredQuotes.length === 0 ? (
            <div className="rounded-md border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500">
              {search ? "No se encontraron resultados." : "No hay presupuestos pendientes."}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nro</TableHead>
                    <TableHead className="hidden md:table-cell">Fecha</TableHead>
                    <TableHead className="hidden md:table-cell">Método de pago</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Ítems</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-40" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotes.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">
                        {receipt.receiptNumber}
                        <div className="md:hidden text-xs text-neutral-400 mt-0.5">
                          {receipt.paymentMethod} · {receipt.createdAt.toLocaleDateString("es-AR")}
                        </div>
                      </TableCell>
                      <TableCell className="text-neutral-500 hidden md:table-cell">
                        {receipt.createdAt.toLocaleDateString("es-AR")}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{receipt.paymentMethod}</TableCell>
                      <TableCell className="text-right hidden md:table-cell">{receipt.items.length}</TableCell>
                      <TableCell className="text-right font-medium">${formatPrice(receipt.total)}</TableCell>
                      <TableCell>
                        <TooltipProvider delayDuration={300}>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/dashboard/recibos/${receipt.id}/edit`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <LuPencil className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>Ver / Editar</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPrintingReceipt(receipt)}>
                                  <LuPrinter className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Imprimir</TooltipContent>
                            </Tooltip>
                            {confirmingId === receipt.id ? (
                              <div className="flex items-center gap-1">
                                <Button variant="default" size="xs" disabled={actionLoading === receipt.id} onClick={() => handleConfirmQuote(receipt.id)}>
                                  {actionLoading === receipt.id ? "..." : "Sí"}
                                </Button>
                                <Button variant="outline" size="xs" onClick={() => setConfirmingId(null)}>No</Button>
                              </div>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-neutral-500 hover:text-green-600"
                                    disabled={isReadOnly}
                                    onClick={() => { setConfirmingId(receipt.id); setCancelingId(null); }}
                                  >
                                    <LuCheck className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Confirmar</TooltipContent>
                              </Tooltip>
                            )}
                            {cancelingId === receipt.id ? (
                              <div className="flex items-center gap-1">
                                <Button variant="destructive" size="xs" disabled={actionLoading === receipt.id} onClick={() => handleCancelQuote(receipt.id)}>
                                  {actionLoading === receipt.id ? "..." : "Sí"}
                                </Button>
                                <Button variant="outline" size="xs" onClick={() => setCancelingId(null)}>No</Button>
                              </div>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-neutral-500 hover:text-red-600"
                                    disabled={isReadOnly}
                                    onClick={() => { setCancelingId(receipt.id); setConfirmingId(null); }}
                                  >
                                    <LuX className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Cancelar</TooltipContent>
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
          )}
        </div>
      )}

    </div>
  );
}
