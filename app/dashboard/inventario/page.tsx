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
import { LuPlus, LuPencil, LuTrash2, LuSearch, LuUpload, LuX, LuTag, LuChevronLeft, LuChevronRight, LuArrowUp, LuArrowDown, LuArrowUpDown, LuFilter } from "react-icons/lu";
import { Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useStorePlan } from "@/hooks/use-store-plan";
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
  const { isReadOnly } = useStorePlan();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending">("all");
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<"name" | "price" | "stock" | "active" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);

  const availableCategories = Array.from(
    new Set(products.map((p) => p.categoryName).filter(Boolean))
  ).sort() as string[];

  const filtered = products
    .filter((p) => {
      if (statusFilter === "active") return p.active;
      if (statusFilter === "pending") return !p.active && hasMissingData(p);
      return true;
    })
    .filter((p) => {
      if (selectedCategories.size === 0) return true;
      return p.categoryName && selectedCategories.has(p.categoryName);
    })
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortKey) return 0;
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "price") return (a.price - b.price) * dir;
      if (sortKey === "stock") return (a.stock - b.stock) * dir;
      if (sortKey === "active") return (Number(a.active) - Number(b.active)) * dir;
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filtered.slice(startIndex, startIndex + itemsPerPage);

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

  function handleSort(key: "name" | "price" | "stock" | "active") {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
      setSortDir("asc");
    }
    setCurrentPage(1);
  }

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
    setCurrentPage(1);
  }

  function removeCategory(cat: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.delete(cat);
      return next;
    });
    setCurrentPage(1);
  }

  function SortIcon({ column }: { column: "name" | "price" | "stock" | "active" }) {
    if (sortKey !== column) return <LuArrowUpDown className="ml-1 h-3.5 w-3.5 text-neutral-400" />;
    if (sortDir === "asc") return <LuArrowUp className="ml-1 h-3.5 w-3.5" />;
    return <LuArrowDown className="ml-1 h-3.5 w-3.5" />;
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
      <BulkImportDialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen} />

      {/* Search + Filtro + Botones */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="relative w-full sm:w-auto sm:max-w-sm sm:flex-1">
          <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Buscar por nombre, SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as "all" | "active" | "pending"); setCurrentPage(1); }}>
          <SelectTrigger className="w-auto gap-0">
            <span className="text-neutral-500">Estado:&nbsp;</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
          </SelectContent>
        </Select>
        {availableCategories.length > 0 && (
          <Popover open={categoryFilterOpen} onOpenChange={setCategoryFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <LuFilter className="h-4 w-4" />
                Categorías
                {selectedCategories.size > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                    {selectedCategories.size}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {availableCategories.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-100 cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={selectedCategories.has(cat)}
                      onCheckedChange={() => toggleCategory(cat)}
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
        <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
          <Button size="sm" variant="outline" onClick={() => setBulkDialogOpen(true)} disabled={isReadOnly}>
            <LuUpload className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">Importar Inventario</span>
            <span className="sm:hidden">Importar</span>
          </Button>
          <Link href="/dashboard/inventario/create" className={isReadOnly ? "pointer-events-none" : ""}>
            <Button size="sm" disabled={isReadOnly}>
              <LuPlus className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Agregar producto</span>
              <span className="sm:hidden">Agregar</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Category tags */}
      {selectedCategories.size > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {Array.from(selectedCategories).map((cat) => (
            <Badge key={cat} variant="secondary" className="gap-1 pr-1">
              {cat}
              <button
                onClick={() => removeCategory(cat)}
                className="ml-0.5 rounded-full hover:bg-neutral-300 p-0.5"
              >
                <LuX className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <button
            onClick={() => { setSelectedCategories(new Set()); setCurrentPage(1); }}
            className="text-xs text-neutral-500 hover:text-neutral-700"
          >
            Limpiar filtros
          </button>
        </div>
      )}

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
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-12 hidden md:table-cell">Img</TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>
                  <span className="inline-flex items-center">Nombre<SortIcon column="name" /></span>
                </TableHead>
                <TableHead className="hidden md:table-cell">Categoría</TableHead>
                <TableHead className="hidden md:table-cell">SKU</TableHead>
                <TableHead className="text-right hidden md:table-cell">Precio C.</TableHead>
                <TableHead className="text-right cursor-pointer select-none" onClick={() => handleSort("price")}>
                  <span className="inline-flex items-center justify-end w-full">Precio V.<SortIcon column="price" /></span>
                </TableHead>
                <TableHead className="text-right cursor-pointer select-none" onClick={() => handleSort("stock")}>
                  <span className="inline-flex items-center justify-end w-full">Stock<SortIcon column="stock" /></span>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort("active")}>
                  <span className="inline-flex items-center">Estado<SortIcon column="active" /></span>
                </TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(product.id)}
                      onCheckedChange={() => toggleSelect(product.id)}
                    />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
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
                  <TableCell className="text-neutral-500 hidden md:table-cell">
                    {product.categoryName || "—"}
                  </TableCell>
                  <TableCell className="text-neutral-500 hidden md:table-cell">
                    {product.sku || "—"}
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell">
                    {product.costPrice != null ? `$${formatPrice(product.costPrice)}` : "—"}
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
                      <Link href={`/dashboard/inventario/${product.id}/edit`} className={isReadOnly ? "pointer-events-none" : ""}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isReadOnly}
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
                          disabled={isReadOnly}
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

      {/* Paginación */}
      {filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-neutral-500">Mostrar</span>
            <Select value={String(itemsPerPage)} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="75">75</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-neutral-500">por página</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              <LuChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-neutral-500 px-2">{currentPage} / {totalPages}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
              <LuChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <span className="hidden sm:block text-sm text-neutral-500">
            Mostrando {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filtered.length)} de {filtered.length} productos
          </span>
        </div>
      )}

      {/* Barra flotante de acciones */}
      {someSelected && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-lg flex flex-wrap items-center justify-center gap-2 sm:gap-4 max-w-[calc(100vw-2rem)]">
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
