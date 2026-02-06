"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import type { Category } from "@/types/category";

interface CategorySelectProps {
  storeId: string;
  value: string | null;
  onChange: (categoryId: string | null) => void;
}

export function CategorySelect({ storeId, value, onChange }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    setError(null);

    const res = await window.fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), storeId }),
    });

    if (res.ok) {
      const cat = await res.json();
      setCategories((prev) => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)));
      onChange(cat.id);
      setNewName("");
      setShowInput(false);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Error al crear categoria");
    }

    setAdding(false);
  }

  if (loading) {
    return (
      <select disabled className="w-full rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm">
        <option>Cargando...</option>
      </select>
    );
  }

  return (
    <div className="space-y-2">
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

      {showInput ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value.toUpperCase())}
              placeholder="Nombre de categoría"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={adding || !newName.trim()} size="sm">
              {adding ? "..." : "Crear"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setShowInput(false); setNewName(""); setError(null); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      ) : (
        <Button variant="link" size="sm" className="h-auto p-0 text-sm" onClick={() => setShowInput(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Añadir categoría
        </Button>
      )}
    </div>
  );
}
