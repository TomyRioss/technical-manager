"use client";

import { useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/contexts/dashboard-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LuPlus, LuPencil, LuTrash2, LuSearch, LuUpload, LuX, LuTag } from "react-icons/lu";
import { Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { BulkImportDialog } from "@/components/inventario/bulk-import-dialog";
import { CategorySelect } from "@/components/ui/category-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Product } from "@/types/product";

function getMissingData(product: Product): string[] {
  const missing: string[] = [];
  if (!product.price || product.price <= 0) missing.push("Precio");
  if (product.costPrice === undefined || product.costPrice === null) missing.push("Costo");
  return missing;
}

function hasMissingData(product: Product): boolean {
  return !product.price || product.price <= 0 ||
         product.costPrice === undefined || product.costPrice === null;
}

export default function InventarioPage() {
  const { products, deleteProduct, updateProductCategory, storeId, loading } = useDashboard();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending">("all");
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);

  const filtered = products
    .filter((p) => {
      if (statusFilter === "active") return p.active;
      if (statusFilter === "pending") return !p.active && hasMissingData(p);
      return true;
    })
    .filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id));
  const someSelected = selectedIds.size > 0;

  function handleDelete(id: string) {
    deleteProduct(id);
    setDeletingId(null);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function handleBulkDelete() {
    selectedIds.forEach((id) => deleteProduct(id));
    setSelectedIds(new Set());
  }

  async function handleBulkCategoryChange(categoryId: string | null) {
    await Promise.all(
      Array.from(selectedIds).map((id) => updateProductCategory(id, categoryId))
    );
    setSelectedIds(new Set());
    setCategoryPopoverOpen(false);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900">Inventario</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setBulkDialogOpen(true)}>
            <LuUpload className="mr-1.5 h-4 w-4" />
            Importar Inventario
          </Button>
          <Link href="/dashboard/inventario/create">
            <Button size="sm">
              <LuPlus className="mr-1.5 h-4 w-4" />
              Agregar producto
            </Button>
          </Link>
        </div>
      </div>

      <BulkImportDialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen} />

      {/* Search + Filtro */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Buscar por nombre, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "active" | "pending")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-md border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-neutral-400" />
          <p className="mt-2">Cargando...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500">
          {products.length === 0
            ? "No hay productos. Agregá uno para empezar."
            : "No se encontraron resultados."}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-12">Img</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(product.id)}
                      onCheckedChange={() => toggleSelect(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-neutral-200" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {product.name}
                  </TableCell>
                  <TableCell className="text-neutral-500">
                    {product.categoryName || "—"}
                  </TableCell>
                  <TableCell className="text-neutral-500">
                    {product.sku || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.price > 0 ? `$${formatPrice(product.price)}` : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.stock}
                  </TableCell>
                  <TableCell>
                    {product.active ? (
                      <Badge variant="default">Activo</Badge>
                    ) : (
                      <span className="text-orange-500 text-xs">
                        {(() => {
                          const missing = getMissingData(product);
                          return missing.length === 1
                            ? `${missing[0]} pendiente`
                            : `${missing.length} datos pendientes`;
                        })()}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/dashboard/inventario/${product.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <LuPencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      {deletingId === product.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="destructive"
                            size="xs"
                            onClick={() => handleDelete(product.id)}
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
                          onClick={() => setDeletingId(product.id)}
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

      {/* Barra flotante de acciones */}
      {someSelected && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-4">
          <span className="text-sm">{selectedIds.size} seleccionado{selectedIds.size > 1 && "s"}</span>
          <div className="flex items-center gap-2">
            <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <LuTag className="mr-1.5 h-4 w-4" />
                  Cambiar categoría
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" side="top">
                <p className="text-sm font-medium mb-2">Seleccionar categoría</p>
                <CategorySelect
                  storeId={storeId}
                  value={null}
                  onChange={handleBulkCategoryChange}
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={clearSelection}
            >
              <LuX className="mr-1.5 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <LuTrash2 className="mr-1.5 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
