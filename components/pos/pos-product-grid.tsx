"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";
import { LuPlus, LuCheck, LuX } from "react-icons/lu";

function isServiceCategory(categoryName: string | undefined): boolean {
  if (!categoryName) return false;
  const n = categoryName.toLowerCase();
  return n.includes("servicio") || n.includes("reparaci");
}

interface PosProductGridProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onAddService: (product: Product) => void;
}

export function PosProductGrid({ products, onAddProduct, onAddService }: PosProductGridProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [feedback, setFeedback] = useState<Record<string, 'success' | 'error'>>({});

  function handleCardClick(product: Product, isService: boolean) {
    if (!isService && product.stock <= 0) {
      setFeedback((prev) => ({ ...prev, [product.id]: 'error' }));
      setTimeout(() => setFeedback((prev) => { const n = { ...prev }; delete n[product.id]; return n; }), 900);
      return;
    }
    setFeedback((prev) => ({ ...prev, [product.id]: 'success' }));
    setTimeout(() => setFeedback((prev) => { const n = { ...prev }; delete n[product.id]; return n; }), 900);
    if (isService) onAddService(product);
    else onAddProduct(product);
  }

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of products) {
      if (p.categoryId && p.categoryName) {
        seen.set(p.categoryId, p.categoryName);
      }
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      if (!p.active) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
      if (categoryFilter !== "all" && p.categoryId !== categoryFilter) return false;
      return true;
    });
  }, [products, search, categoryFilter]);

  return (
    <div className="flex flex-col h-full gap-3">
      <Input
        placeholder="Buscar por nombre o SKU..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter("all")}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
            categoryFilter === "all"
              ? "bg-neutral-900 text-white border-neutral-900"
              : "bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50"
          )}
        >
          Todas
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategoryFilter(c.id)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
              categoryFilter === c.id
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

<div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-10">
            No hay productos que coincidan
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-2">
            {filtered.map((product) => {
              const isService = isServiceCategory(product.categoryName);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleCardClick(product, isService)}
                  className="relative cursor-pointer text-left border border-neutral-200 rounded-lg p-3 hover:bg-neutral-50 hover:border-neutral-400 transition-colors"
                >
                  <div className="mb-1">
                    <div className="flex items-start gap-1 mb-0.5">
                      <span className="text-sm font-medium leading-tight line-clamp-2 flex-1">{product.name}</span>
                    </div>
                    {isService && (
                      <Badge variant="outline" className="text-[10px]">Servicio</Badge>
                    )}
                  </div>
                  <p className="text-base font-semibold text-neutral-900">{formatPrice(product.price)}</p>
                  <p className="text-xs text-neutral-500">Stock: {product.stock}</p>
                  {product.categoryName && (
                    <p className="text-xs text-neutral-400 mt-0.5 truncate">{product.categoryName}</p>
                  )}
                  <span className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-200",
                    feedback[product.id] === 'success' && "text-green-500 scale-110",
                    feedback[product.id] === 'error' && "text-red-500 scale-110",
                    !feedback[product.id] && "text-neutral-400"
                  )}>
                    {feedback[product.id] === 'success' ? (
                      <LuCheck className="h-6 w-6" />
                    ) : feedback[product.id] === 'error' ? (
                      <LuX className="h-6 w-6" />
                    ) : (
                      <LuPlus className="h-6 w-6" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
