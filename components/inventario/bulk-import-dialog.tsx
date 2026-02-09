"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { LuUpload, LuCircleAlert, LuDownload } from "react-icons/lu";
import { parseFile, mergeInternalDuplicates, type ParsedItem, type ParseResult } from "@/lib/parse-import";
import { useDashboard } from "@/contexts/dashboard-context";
import { formatPrice } from "@/lib/utils";

const EXAMPLE_CSV = `CODIGO,DESCRIPCION,CTDAD,PRECIO,precioVenta,CATEGORIA
SKU001,Producto ejemplo 1,10,1500,2500,Bebidas
SKU002,Producto ejemplo 2,5,800,1200,Snacks
SKU003,Producto sin precio venta,3,500,,
`;

function downloadExampleCSV() {
  const blob = new Blob([EXAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ejemplo_productos.csv";
  link.click();
  URL.revokeObjectURL(url);
}

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkImportDialog({ open, onOpenChange }: BulkImportDialogProps) {
  const { storeId } = useDashboard();

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeDuplicates, setActiveDuplicates] = useState<Set<string>>(new Set());
  const [internalDuplicates, setInternalDuplicates] = useState<Set<string>>(new Set());
  const [editableSkuIndices, setEditableSkuIndices] = useState<Set<number>>(new Set());
  const [showConfirmWarning, setShowConfirmWarning] = useState(false);

  useEffect(() => {
    if (open && storeId) {
      fetch(`/api/categories?storeId=${storeId}`)
        .then((res) => res.json())
        .then((data) => setCategories(data))
        .catch(() => setCategories([]));
    }
  }, [open, storeId]);

  const checkDuplicateSkus = useCallback(async (parsed: ParsedItem[]) => {
    const skus = parsed.map((item) => item.sku).filter(Boolean);
    if (skus.length === 0 || !storeId) return;

    try {
      const res = await fetch("/api/items/check-skus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, skus }),
      });
      const data = await res.json();
      setActiveDuplicates(new Set(data.activeDuplicates || []));
    } catch {
      setActiveDuplicates(new Set());
    }
  }, [storeId]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setActiveDuplicates(new Set());
    setInternalDuplicates(new Set());

    try {
      const result = await parseFile(file);
      if (result.items.length === 0) {
        setError("El archivo no contiene productos válidos.");
        setItems([]);
      } else {
        setItems(result.items);
        setInternalDuplicates(result.duplicateSkus);
        // Marcar índices de items con SKU duplicado como editables
        const editableIndices = new Set<number>();
        result.items.forEach((item, idx) => {
          if (result.duplicateSkus.has(item.sku || item.name)) {
            editableIndices.add(idx);
          }
        });
        setEditableSkuIndices(editableIndices);
        await checkDuplicateSkus(result.items);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el archivo.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [checkDuplicateSkus]);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setActiveDuplicates(new Set());
    setInternalDuplicates(new Set());

    try {
      const result = await parseFile(file);
      if (result.items.length === 0) {
        setError("El archivo no contiene productos válidos.");
        setItems([]);
      } else {
        setItems(result.items);
        setInternalDuplicates(result.duplicateSkus);
        // Marcar índices de items con SKU duplicado como editables
        const editableIndices = new Set<number>();
        result.items.forEach((item, idx) => {
          if (result.duplicateSkus.has(item.sku || item.name)) {
            editableIndices.add(idx);
          }
        });
        setEditableSkuIndices(editableIndices);
        await checkDuplicateSkus(result.items);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el archivo.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [checkDuplicateSkus]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  }, []);

  const updateSalePrice = useCallback((index: number, value: string) => {
    const num = parseFloat(value);
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              salePrice: isNaN(num) ? null : num,
              isActive: !isNaN(num) && num > 0,
            }
          : item
      )
    );
  }, []);

  const recalculateInternalDuplicates = useCallback((updatedItems: ParsedItem[]) => {
    const counts = new Map<string, number>();
    for (const item of updatedItems) {
      const key = item.sku || item.name;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const duplicates = new Set<string>();
    for (const [key, count] of counts) {
      if (count > 1) duplicates.add(key);
    }
    setInternalDuplicates(duplicates);
  }, []);

  const updateSku = useCallback((index: number, value: string) => {
    setItems((prev) => {
      const updated = prev.map((item, i) =>
        i === index ? { ...item, sku: value.trim() } : item
      );
      recalculateInternalDuplicates(updated);
      return updated;
    });
  }, [recalculateInternalDuplicates]);

  const handleConfirm = useCallback(async () => {
    if (items.length === 0) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/items/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, items }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar los productos.");
      }

      setItems([]);
      onOpenChange(false);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  }, [items, storeId, onOpenChange]);

  const handleClose = useCallback(() => {
    setItems([]);
    setError(null);
    setActiveDuplicates(new Set());
    setInternalDuplicates(new Set());
    setEditableSkuIndices(new Set());
    setShowConfirmWarning(false);
    onOpenChange(false);
  }, [onOpenChange]);

  const removeDuplicates = useCallback(() => {
    setItems((prev) => prev.filter((item) => !activeDuplicates.has(item.sku)));
    setActiveDuplicates(new Set());
  }, [activeDuplicates]);

  const handleMergeDuplicates = useCallback(async () => {
    const merged = mergeInternalDuplicates(items);
    setItems(merged);
    setEditableSkuIndices(new Set());
    recalculateInternalDuplicates(merged);
    await checkDuplicateSkus(merged);
  }, [items, recalculateInternalDuplicates, checkDuplicateSkus]);

  const pendingCount = items.filter((i) => !i.salePrice).length;
  const duplicateCount = items.filter((i) => activeDuplicates.has(i.sku)).length;
  const internalDuplicateCount = internalDuplicates.size;

  const blockingError = duplicateCount > 0
    ? "Primero debes eliminar todos los productos duplicados."
    : null;

  const handleConfirmClick = useCallback(() => {
    if (pendingCount > 0 || internalDuplicateCount > 0) {
      setShowConfirmWarning(true);
    } else {
      handleConfirm();
    }
  }, [pendingCount, internalDuplicateCount, handleConfirm]);

  function buildWarningMessage(pending: number, duplicates: number): string {
    const parts: string[] = [];
    if (pending > 0) {
      parts.push(`${pending} producto${pending !== 1 ? "s" : ""} sin precio de venta`);
    }
    if (duplicates > 0) {
      parts.push(`${duplicates} SKU${duplicates !== 1 ? "s" : ""} duplicado${duplicates !== 1 ? "s" : ""} en el archivo`);
    }
    return `Tiene ${parts.join(" y ")}. ¿Está seguro que quiere continuar?`;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Carga masiva de productos</DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="space-y-4">
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-sm">
              <p className="font-medium text-neutral-800 mb-2">Formato del archivo</p>
              <p className="text-neutral-600 mb-2">
                El archivo debe tener las siguientes columnas:
              </p>
              <ul className="text-neutral-600 space-y-1 ml-4 list-disc">
                <li><span className="font-mono bg-neutral-100 px-1">CODIGO</span> - SKU del producto</li>
                <li><span className="font-mono bg-neutral-100 px-1">DESCRIPCION</span> - Nombre del producto (requerido)</li>
                <li><span className="font-mono bg-neutral-100 px-1">CTDAD</span> - Cantidad en stock</li>
                <li><span className="font-mono bg-neutral-100 px-1">PRECIO</span> - Precio de costo</li>
                <li><span className="font-mono bg-neutral-100 px-1">precioVenta</span> - Precio de venta (si está vacío, el producto se guarda como inactivo)</li>
                <li>
                  <span className="font-mono bg-neutral-100 px-1">CATEGORIA</span> - Categoría del producto (opcional)
                  {categories.length > 0 && (
                    <p className="text-xs text-neutral-500 mt-1 ml-1">
                      Disponibles: {categories.map((c) => c.name).join(", ")}
                    </p>
                  )}
                </li>
              </ul>
              <Button
                variant="link"
                size="sm"
                className="mt-2 p-0 h-auto text-blue-600"
                onClick={downloadExampleCSV}
              >
                <LuDownload className="mr-1 h-3 w-3" />
                Descargar CSV de ejemplo
              </Button>
            </div>

            <label
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-neutral-400 transition-colors cursor-pointer block"
            >
              <LuUpload className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
              <p className="text-base text-neutral-600 mb-3">
                Arrastrá un archivo CSV o Excel aquí
              </p>
              <span className="text-base text-blue-600 hover:underline">
                o seleccioná un archivo
              </span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              {loading && (
                <p className="text-sm text-neutral-500 mt-3">Procesando...</p>
              )}
            </label>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-neutral-600">
                {items.length} producto{items.length !== 1 && "s"} encontrado{items.length !== 1 && "s"}
              </p>
              <div className="flex items-center gap-2">
                {pendingCount > 0 && (
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    <LuCircleAlert className="mr-1 h-3 w-3" />
                    {pendingCount} sin precio de venta
                  </Badge>
                )}
                {internalDuplicateCount > 0 && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                    <LuCircleAlert className="mr-1 h-3 w-3" />
                    {internalDuplicateCount} duplicado{internalDuplicateCount !== 1 && "s"} en archivo
                  </Badge>
                )}
                {duplicateCount > 0 && (
                  <Badge variant="outline" className="text-red-600 border-red-300">
                    <LuCircleAlert className="mr-1 h-3 w-3" />
                    {duplicateCount} ya existe{duplicateCount !== 1 && "n"} activo{duplicateCount !== 1 && "s"}
                  </Badge>
                )}
              </div>
            </div>
            {internalDuplicateCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3 flex items-center justify-between">
                <p className="text-sm text-yellow-700">
                  {internalDuplicateCount} SKU{internalDuplicateCount !== 1 && "s"} duplicado{internalDuplicateCount !== 1 && "s"} en el archivo. Podés combinarlos sumando stock.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-yellow-600 border-yellow-300 hover:bg-yellow-100"
                  onClick={handleMergeDuplicates}
                >
                  Combinar productos duplicados
                </Button>
              </div>
            )}
            {duplicateCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3 flex items-center justify-between">
                <p className="text-sm text-red-700">
                  {duplicateCount} producto{duplicateCount !== 1 && "s"} ya existe{duplicateCount !== 1 && "n"} como activo{duplicateCount !== 1 && "s"} y no se puede{duplicateCount !== 1 && "n"} sobrescribir.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-100"
                  onClick={removeDuplicates}
                >
                  Eliminar productos existentes
                </Button>
              </div>
            )}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                    <TableHead className="text-right">Precio Venta</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => {
                    const isDuplicate = activeDuplicates.has(item.sku);
                    const isInternalDuplicate = internalDuplicates.has(item.sku || item.name);
                    const isEditable = editableSkuIndices.has(index);
                    const rowClass = isDuplicate
                      ? "bg-red-50"
                      : isInternalDuplicate
                      ? "bg-yellow-50"
                      : "";
                    return (
                      <TableRow key={index} className={rowClass}>
                        <TableCell>
                          {isEditable ? (
                            <Input
                              type="text"
                              value={item.sku}
                              placeholder="SKU..."
                              className={`w-28 h-7 ${isInternalDuplicate ? "border-yellow-400 bg-yellow-50" : "border-green-400 bg-green-50"}`}
                              onChange={(e) => updateSku(index, e.target.value)}
                            />
                          ) : (
                            <span className={isDuplicate ? "text-red-600" : "text-neutral-500"}>
                              {item.sku || "—"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className={isDuplicate ? "font-medium text-red-600" : isInternalDuplicate ? "font-medium text-yellow-700" : "font-medium"}>
                          {item.name}
                        </TableCell>
                        <TableCell className="text-right">{item.stock}</TableCell>
                        <TableCell className="text-right">
                          {item.costPrice !== null ? `$${formatPrice(item.costPrice)}` : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.salePrice !== null ? (
                            `$${formatPrice(item.salePrice)}`
                          ) : (
                            <Input
                              type="number"
                              placeholder="Precio..."
                              className="w-24 h-7 text-right"
                              onChange={(e) => updateSalePrice(index, e.target.value)}
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-neutral-500">
                          {item.category || "—"}
                        </TableCell>
                        <TableCell>
                          {isDuplicate ? (
                            <Badge variant="outline" className="text-red-600 border-red-300">
                              Duplicado
                            </Badge>
                          ) : isInternalDuplicate ? (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-400 bg-yellow-100">
                              SKU duplicado
                            </Badge>
                          ) : item.isActive ? (
                            <Badge variant="default">Activo</Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              Pendiente
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          {items.length > 0 && (
            <Button onClick={handleConfirmClick} disabled={saving || !!blockingError}>
              {saving ? "Guardando..." : `Confirmar carga (${items.length})`}
            </Button>
          )}
          {blockingError && (
            <p className="text-xs text-red-600 ml-2 self-center max-w-48">
              {blockingError}
            </p>
          )}
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={showConfirmWarning} onOpenChange={setShowConfirmWarning}>
        <AlertDialogContent className="p-8 w-[450px]">
          <AlertDialogHeader className="space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <LuCircleAlert className="w-7 h-7 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Confirmar carga con advertencias
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base text-red-700 bg-red-50 rounded-lg p-4">
              {buildWarningMessage(pendingCount, internalDuplicateCount)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3 sm:gap-3">
            <AlertDialogCancel className="flex-1">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
