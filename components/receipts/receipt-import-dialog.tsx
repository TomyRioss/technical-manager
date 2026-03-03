"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LuUpload, LuDownload } from "react-icons/lu";
import { useDashboard } from "@/contexts/dashboard-context";
import { formatPrice } from "@/lib/utils";

const EXAMPLE_CSV = `Número,Estado,Método de Pago,Subtotal,Comisión,Total
REC-001,pagado,Efectivo,10000,500,9500
REC-002,pendiente,Transferencia Debito,5000,0,5000
`;

function downloadExampleCSV() {
  const blob = new Blob([EXAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ejemplo_recibos.csv";
  link.click();
  URL.revokeObjectURL(url);
}

interface ReceiptRow {
  Número: string;
  Estado?: string;
  "Método de Pago"?: string;
  Subtotal?: string;
  Comisión?: string;
  Total?: string;
}

function parseCSV(text: string): ReceiptRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return row as ReceiptRow;
  }).filter((r) => r.Número);
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiptImportDialog({ open, onOpenChange }: Props) {
  const { storeId, branchId } = useDashboard();
  const [rows, setRows] = useState<ReceiptRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Solo se aceptan archivos .csv");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setError("El archivo no contiene filas válidas.");
          setRows([]);
        } else {
          setRows(parsed);
          setError(null);
        }
      } catch {
        setError("Error al procesar el archivo.");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleConfirm = useCallback(async () => {
    if (!storeId || !branchId) {
      setError("No se pudo determinar la tienda o sucursal.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/receipts/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, branchId, receipts: rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al importar");
      setRows([]);
      onOpenChange(false);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar.");
    } finally {
      setSaving(false);
    }
  }, [storeId, branchId, rows, onOpenChange]);

  const handleClose = useCallback(() => {
    setRows([]);
    setError(null);
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Importar recibos desde CSV</DialogTitle>
        </DialogHeader>

        {rows.length === 0 ? (
          <div className="space-y-4">
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-sm">
              <p className="font-medium text-neutral-800 mb-2">Columnas requeridas</p>
              <ul className="text-neutral-600 space-y-1 ml-4 list-disc">
                <li><span className="font-mono bg-neutral-100 px-1">Número</span> — número de recibo (requerido)</li>
                <li><span className="font-mono bg-neutral-100 px-1">Estado</span> — pagado, pendiente, anulado (opcional)</li>
                <li><span className="font-mono bg-neutral-100 px-1">Método de Pago</span> — Efectivo, Transferencia Debito, Transferencia Credito, Otro</li>
                <li><span className="font-mono bg-neutral-100 px-1">Subtotal</span> — monto antes de comisión</li>
                <li><span className="font-mono bg-neutral-100 px-1">Comisión</span> — monto de comisión</li>
                <li><span className="font-mono bg-neutral-100 px-1">Total</span> — monto final</li>
              </ul>
              <Button variant="link" size="sm" className="mt-2 p-0 h-auto text-blue-600" onClick={downloadExampleCSV}>
                <LuDownload className="mr-1 h-3 w-3" />
                Descargar CSV de ejemplo
              </Button>
            </div>
            <label
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-neutral-400 transition-colors cursor-pointer block"
            >
              <LuUpload className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
              <p className="text-base text-neutral-600 mb-3">Arrastrá un archivo CSV aquí</p>
              <span className="text-base text-blue-600 hover:underline">o seleccioná un archivo</span>
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <p className="text-sm text-neutral-600 mb-3">{rows.length} recibo{rows.length !== 1 && "s"} encontrado{rows.length !== 1 && "s"}</p>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Método de Pago</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Comisión</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.Número}</TableCell>
                      <TableCell className="text-neutral-500">{row.Estado || "pagado"}</TableCell>
                      <TableCell>{row["Método de Pago"] || "Efectivo"}</TableCell>
                      <TableCell className="text-right">{row.Subtotal ? `$${formatPrice(parseFloat(row.Subtotal))}` : "—"}</TableCell>
                      <TableCell className="text-right">{row.Comisión ? `$${formatPrice(parseFloat(row.Comisión))}` : "—"}</TableCell>
                      <TableCell className="text-right">{row.Total ? `$${formatPrice(parseFloat(row.Total))}` : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose} disabled={saving}>Cancelar</Button>
          {rows.length > 0 && (
            <Button onClick={handleConfirm} disabled={saving}>
              {saving ? "Importando..." : `Importar ${rows.length} recibo${rows.length !== 1 ? "s" : ""}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
