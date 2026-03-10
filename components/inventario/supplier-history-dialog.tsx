"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface ImportLog {
  id: string;
  type: string;
  itemCount: number;
  notes: string | null;
  createdAt: string;
  supplier: { id: string; name: string };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupplierHistoryDialog({ open, onOpenChange }: Props) {
  const { storeId } = useDashboard();
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !storeId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/supplier-import-logs?storeId=${storeId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar historial");
        return r.json();
      })
      .then(setLogs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open, storeId]);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${min}`;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Historial de importaciones</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-600 py-4">{error}</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-neutral-500 py-6 text-center">Sin historial de importaciones</p>
        ) : (
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">{formatDate(log.createdAt)}</TableCell>
                    <TableCell className="text-sm text-neutral-500">{formatTime(log.createdAt)}</TableCell>
                    <TableCell className="text-sm font-medium">{log.supplier.name}</TableCell>
                    <TableCell className="text-sm">
                      {log.type === "single" ? "Producto creado" : "Catálogo importado"}
                    </TableCell>
                    <TableCell className="text-right text-sm">{log.itemCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
