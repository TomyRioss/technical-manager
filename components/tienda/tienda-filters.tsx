"use client";

import { cn } from "@/lib/utils";

interface TiendaFiltersProps {
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  primaryColor: string;
}

export function TiendaFilters({
  categories,
  activeCategory,
  onCategoryChange,
}: TiendaFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onCategoryChange(null)}
        className={cn(
          "rounded-full px-5 py-2 text-sm font-medium transition-colors",
          activeCategory === null
            ? "bg-neutral-900 text-white"
            : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
        )}
      >
        TODOS
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-medium transition-colors",
            activeCategory === cat
              ? "bg-neutral-900 text-white"
              : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
