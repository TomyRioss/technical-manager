"use client";

import { useState, useEffect, useCallback } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import type { Category } from "@/types/category";

export default function CategoriasPage() {
  const { storeId } = useDashboard();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    const res = await fetch(`/api/categories?storeId=${storeId}`);
    if (res.ok) {
      const data = await res.json();
      setCategories(data);
    }
    setLoading(false);
  }, [storeId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    setError(null);

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), storeId }),
    });

    if (res.ok) {
      const cat = await res.json();
      setCategories((prev) => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Error al crear categoria");
    }

    setAdding(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  }

  if (loading) {
    return <p className="text-sm text-neutral-500">Cargando categorias...</p>;
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Categorias de Productos</h1>
        <p className="text-sm text-neutral-500">
          Administra las categorias para organizar tu inventario y catalogo.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value.toUpperCase())}
          placeholder="Nueva categoria (ej: FUNDAS)"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={adding || !newName.trim()}>
          <LuPlus className="h-4 w-4 mr-1" />
          Agregar
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {categories.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay categorias creadas.</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-4 py-3"
            >
              <span className="font-medium text-neutral-900">{cat.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDelete(cat.id)}
              >
                <LuTrash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
