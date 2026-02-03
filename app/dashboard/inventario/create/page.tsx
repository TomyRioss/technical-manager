"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/contexts/dashboard-context";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PriceInput } from "@/components/ui/price-input";
import { CategorySelect } from "@/components/ui/category-select";
import { LuArrowLeft, LuUpload } from "react-icons/lu";
import Link from "next/link";

function generateSku(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  let sku = "";
  for (let i = 0; i < 3; i++) sku += letters[Math.floor(Math.random() * 26)];
  for (let i = 0; i < 6; i++) sku += digits[Math.floor(Math.random() * 10)];
  for (let i = 0; i < 3; i++) sku += letters[Math.floor(Math.random() * 26)];
  return sku;
}

const emptyProduct: Omit<Product, "id"> = {
  name: "",
  sku: generateSku(),
  price: 0,
  stock: 0,
  active: true,
  categoryId: undefined,
};

export default function CreateProductPage() {
  const router = useRouter();
  const { storeId, addProduct, setProductImage } = useDashboard();
  const [form, setForm] = useState(emptyProduct);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(file: File, itemId: string): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("itemId", itemId);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url;
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);

    const itemId = await addProduct(form);

    if (imageFile && itemId) {
      const url = await uploadImage(imageFile, itemId);
      if (url) setProductImage(itemId, url);
    }

    setSaving(false);
    router.push("/dashboard/inventario");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/inventario">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <LuArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-neutral-900">
          Nuevo producto
        </h1>
      </div>

      <div className="w-full space-y-4">
        {/* Image */}
        <div className="space-y-2">
          <Label>Imagen</Label>
          {imagePreview ? (
            <div className="flex items-center gap-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-16 w-16 rounded object-cover"
              />
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="max-w-56"
              />
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-neutral-300 py-6 text-sm text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700">
              <LuUpload className="h-6 w-6" />
              <span>Subir archivo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Nombre del producto"
          />
        </div>

        {/* SKU */}
        <div className="space-y-2">
          <Label htmlFor="sku">SKU / Codigo</Label>
          <Input
            id="sku"
            value={form.sku}
            onChange={(e) =>
              setForm((f) => ({ ...f, sku: e.target.value }))
            }
            placeholder="ABC-001"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Categoria</Label>
          <CategorySelect
            storeId={storeId}
            value={form.categoryId || null}
            onChange={(categoryId) => setForm((f) => ({ ...f, categoryId: categoryId || undefined }))}
          />
        </div>

        {/* Price + Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Precio de venta</Label>
            <PriceInput
              id="price"
              value={form.price}
              onChange={(price) => setForm((f) => ({ ...f, price }))}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              min={0}
              value={form.stock || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  stock: parseInt(e.target.value) || 0,
                }))
              }
              placeholder="0"
            />
          </div>
        </div>

        {/* Active */}
        <div className="flex items-center space-x-2">
          <Label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
              className="h-4 w-4 rounded border-neutral-300"
            />
            Producto activo
          </Label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Agregar producto"}
          </Button>
          <Link href="/dashboard/inventario">
            <Button variant="outline">Cancelar</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
