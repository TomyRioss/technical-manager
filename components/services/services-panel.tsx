"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useDashboard } from "@/contexts/dashboard-context";
import { LuPlus, LuPencil, LuTrash2, LuCheck, LuX } from "react-icons/lu";

interface Category {
  id: string;
  name: string;
}

interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  salePrice: number;
  stock: number;
  categoryId: string | null;
  category?: { id: string; name: string } | null;
}

interface FormState {
  name: string;
  description: string;
  salePrice: string;
}

const SERVICES_CATEGORY = "SERVICIOS";

export function ServicesPanel() {
  const { storeId, branchId } = useDashboard();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [form, setForm] = useState<FormState>({ name: "", description: "", salePrice: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: categories = [] } = useSWR<Category[]>(`/api/categories?storeId=${storeId}`);
  const { data: items = [], mutate: mutateItems } = useSWR<ServiceItem[]>(
    `/api/items?storeId=${storeId}&branchId=${branchId}`
  );

  const servicesCategory = categories.find((c) => c.name === SERVICES_CATEGORY);
  const services = items.filter(
    (i) => i.category?.name === SERVICES_CATEGORY || i.categoryId === servicesCategory?.id
  );

  async function ensureServicesCategoryId(): Promise<string | null> {
    if (servicesCategory) return servicesCategory.id;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: SERVICES_CATEGORY, storeId }),
    });
    const data = await res.json();
    if (!res.ok) {
      // Maybe it already exists (race), try to find it
      const existing = categories.find((c) => c.name === SERVICES_CATEGORY);
      if (existing) return existing.id;
      throw new Error(data.error || "Error al crear categoría");
    }
    return data.id;
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", salePrice: "" });
    setError(null);
    setModalOpen(true);
  }

  function openEdit(item: ServiceItem) {
    setEditing(item);
    setForm({ name: item.name, description: item.description || "", salePrice: String(item.salePrice) });
    setError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    setError(null);
    if (!form.name.trim()) { setError("El nombre es requerido"); return; }
    const price = parseFloat(form.salePrice);
    if (isNaN(price) || price < 0) { setError("El precio debe ser un número válido"); return; }

    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/items/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name.trim(), description: form.description.trim() || null, salePrice: price }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al actualizar");
      } else {
        const categoryId = await ensureServicesCategoryId();
        const res = await fetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim() || null,
            salePrice: price,
            stock: 9999,
            storeId,
            branchId,
            categoryId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al crear servicio");
      }
      await mutateItems();
      setModalOpen(false);
      setSuccess(editing ? "Servicio actualizado correctamente" : "Servicio creado correctamente");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/items/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      await mutateItems();
      setDeleteId(null);
      setSuccess("Servicio eliminado correctamente");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {success && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
          <LuCheck className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          {services.length} servicio{services.length !== 1 ? "s" : ""} registrado{services.length !== 1 ? "s" : ""}
        </p>
        <Button onClick={openCreate}>
          <LuPlus className="h-4 w-4 mr-1" />
          Nuevo servicio
        </Button>
      </div>

      {services.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-12">No hay servicios registrados.</p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-neutral-600">Nombre</th>
                <th className="text-left px-4 py-2 font-medium text-neutral-600 hidden sm:table-cell">Descripción</th>
                <th className="text-right px-4 py-2 font-medium text-neutral-600">Precio</th>
                <th className="px-4 py-2 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-neutral-500 hidden sm:table-cell">{s.description || "—"}</td>
                  <td className="px-4 py-3 text-right">${s.salePrice.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-neutral-100">
                        <LuPencil className="h-3.5 w-3.5 text-neutral-500" />
                      </button>
                      <button onClick={() => { setError(null); setDeleteId(s.id); }} className="p-1.5 rounded hover:bg-red-50">
                        <LuTrash2 className="h-3.5 w-3.5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar servicio" : "Nuevo servicio"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="svc-name">Nombre</Label>
              <Input
                id="svc-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Cambio de vidrio templado"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-desc">Descripción</Label>
              <Input
                id="svc-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Opcional"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-price">Precio</Label>
              <Input
                id="svc-price"
                type="number"
                min="0"
                step="0.01"
                value={form.salePrice}
                onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                <LuX className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar servicio</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-600 py-2">¿Estás seguro que deseas eliminar este servicio? Esta acción no se puede deshacer.</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? "Eliminando..." : "Eliminar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
