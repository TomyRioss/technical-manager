"use client";

import { useState, useEffect } from "react";
import type { Category } from "@/types/category";

interface CategorySelectProps {
  storeId: string;
  value: string | null;
  onChange: (categoryId: string | null) => void;
}

export function CategorySelect({ storeId, value, onChange }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const res = await window.fetch(`/api/categories?storeId=${storeId}`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
      setLoading(false);
    }
    fetch();
  }, [storeId]);

  if (loading) {
    return (
      <select disabled className="w-full rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm">
        <option>Cargando...</option>
      </select>
    );
  }

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
    >
      <option value="">Sin categoria</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}
