"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDashboard } from "@/contexts/dashboard-context";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategorySelect } from "@/components/ui/category-select";
import { LuArrowLeft, LuUpload } from "react-icons/lu";
import Link from "next/link";

const emptyProduct: Omit<Product, "id"> = {
  name: "",
  sku: "",
  costPrice: undefined,
  price: 0,
  stock: 0,
  active: true,
  categoryId: undefined,
};

function formatNumber(value: number | undefined): string {
  if (value === undefined || value === 0) return "";
  return value.toLocaleString("es-AR");
}

function parseFormattedNumber(value: string): number {
  const cleaned = value.replace(/\./g, "").replace(/,/g, ".");
  return parseFloat(cleaned) || 0;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { storeId, getProduct, updateProduct, setProductImage } = useDashboard();

  const [form, setForm] = useState<Omit<Product, "id">>(emptyProduct);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const product = getProduct(id);
    if (!product) {
      setNotFound(true);
      return;
    }
    setForm({
      name: product.name,
      sku: product.sku,
      costPrice: product.costPrice,
      price: product.price,
      stock: product.stock,
      active: product.active,
      categoryId: product.categoryId,
    });
    setImagePreview(product.imageUrl || null);
  }, [id, getProduct]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("itemId", id);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url;
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    setUploadError(null);

    await updateProduct(id, form);
    let hadUploadError = false;

    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (url) {
        setProductImage(id, url);
      } else {
        hadUploadError = true;
        setUploadError("No se pudo subir la imagen. Los demás cambios se guardaron correctamente.");
      }
    }

    setSaving(false);
    if (!hadUploadError) router.push("/dashboard/inventario");
  }

  if (notFound) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/inventario">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <LuArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-neutral-900">
            Producto no encontrado
          </h1>
        </div>
        <p className="text-sm text-neutral-500">
          El producto que buscas no existe.
        </p>
      </div>
    );
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
          Editar producto
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

        {/* Cost Price + Sale Price */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="costPrice">Precio de costo</Label>
            <Input
              id="costPrice"
              type="text"
              inputMode="numeric"
              value={formatNumber(form.costPrice)}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  costPrice: parseFormattedNumber(e.target.value) || undefined,
                }))
              }
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Precio de venta</Label>
            <Input
              id="price"
              type="text"
              inputMode="numeric"
              value={formatNumber(form.price)}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  price: parseFormattedNumber(e.target.value),
                }))
              }
              placeholder="0"
            />
          </div>
        </div>

        {/* Stock */}
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
            className="max-w-32"
          />
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

        {uploadError && (
          <p className="text-sm text-red-600 font-medium">{uploadError}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
          <Link href="/dashboard/inventario">
            <Button variant="outline">Cancelar</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
