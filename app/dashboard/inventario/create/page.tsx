"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/contexts/dashboard-context";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PriceInput } from "@/components/ui/price-input";
import { CategorySelect } from "@/components/ui/category-select";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { LuUpload } from "react-icons/lu";

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
  costPrice: 0,
  price: 0,
  stock: 0,
  active: true,
  categoryId: undefined,
};

export default function CreateProductPage() {
  const router = useRouter();
  const { storeId, addProduct, setProductImage } = useDashboard();
  const [formMode, setFormMode] = useState<"steps" | "complete">("steps");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyProduct);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch(`/api/categories?storeId=${storeId}`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    }
    fetchCategories();
  }, [storeId]);

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
    setUploadError(null);

    const itemId = await addProduct(form);
    let hadUploadError = false;

    if (imageFile && itemId) {
      const url = await uploadImage(imageFile, itemId);
      if (url) {
        setProductImage(itemId, url);
      } else {
        hadUploadError = true;
        setUploadError("No se pudo subir la imagen. El producto se guardó sin imagen.");
      }
    }

    setSaving(false);
    if (!hadUploadError) router.push("/dashboard/inventario");
  }

  function canContinue() {
    switch (step) {
      case 1: return form.name.trim().length > 0;
      case 2: return form.price > 0;
      case 3: return form.stock >= 0;
      case 4: return !!form.categoryId;
      default: return false;
    }
  }

  function handleContinue() {
    if (canContinue() && step < 5) {
      setStep(step + 1);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && step < 5) {
      e.preventDefault();
      handleContinue();
    }
  }

  const progressValue = (step / 5) * 100;

  const ProgressBar = () => (
    <div className="w-full max-w-md mt-8">
      <Progress value={progressValue} className="h-2" />
      <p className="text-xs text-muted-foreground text-center mt-1">Paso {step} de 5</p>
    </div>
  );

  const categoryName = categories.find(c => c.id === form.categoryId)?.name || "";

  const FormModeSwitch = () => (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Formulario:</span>
      <span className={formMode === "complete" ? "font-medium" : "text-muted-foreground"}>Completo</span>
      <Switch checked={formMode === "steps"} onCheckedChange={(v) => setFormMode(v ? "steps" : "complete")} />
      <span className={formMode === "steps" ? "font-medium" : "text-muted-foreground"}>Pasos</span>
    </div>
  );

  // Complete mode
  if (formMode === "complete") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex justify-end">
          <FormModeSwitch />
        </div>

        {/* Nombre */}
        <div className="space-y-2">
          <Label>Nombre del Producto *</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Nombre del producto"
            autoFocus
          />
        </div>

        {/* Precios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-1">
              Precio de Costo (opcional)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-muted text-muted-foreground text-xs cursor-help border border-gray-400">?</span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-700 text-white max-w-xs">
                    Precio al que el proveedor te vende este producto. Se usa para calcular tus utilidades netas mensuales.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="flex items-center gap-2">
              <PriceInput
                value={form.costPrice || 0}
                onChange={(costPrice) => setForm((f) => ({ ...f, costPrice }))}
                placeholder="$0"
              />
              <span className="text-muted-foreground text-sm whitespace-nowrap">en AR$</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Precio de Venta *</Label>
            <div className="flex items-center gap-2">
              <PriceInput
                value={form.price}
                onChange={(price) => setForm((f) => ({ ...f, price }))}
                placeholder="$0"
              />
              <span className="text-muted-foreground text-sm whitespace-nowrap">en AR$</span>
            </div>
          </div>
        </div>

        {/* Stock */}
        <div className="space-y-2">
          <Label>Stock Inicial *</Label>
          <div className="flex items-center gap-2 max-w-xs">
            <Input
              type="number"
              min={0}
              value={form.stock || ""}
              onChange={(e) => setForm((f) => ({ ...f, stock: parseInt(e.target.value) || 0 }))}
              placeholder="0"
            />
            <span className="text-muted-foreground text-sm">unidades</span>
          </div>
        </div>

        {/* Categoría */}
        <div className="space-y-2">
          <Label>Categoría *</Label>
          <div className="max-w-xs">
            <CategorySelect
              storeId={storeId}
              value={form.categoryId || null}
              onChange={(categoryId) => setForm((f) => ({ ...f, categoryId: categoryId || undefined }))}
            />
          </div>
        </div>

        {/* Imagen */}
        <div className="space-y-2">
          <Label>Imagen</Label>
          {imagePreview ? (
            <div className="flex items-center gap-4">
              <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded object-cover" />
              <Input type="file" accept="image/*" onChange={handleImageChange} className="max-w-56" />
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-neutral-300 py-6 text-sm text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700">
              <LuUpload className="h-6 w-6" />
              <span>Subir archivo</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        {/* SKU */}
        <div className="space-y-2">
          <Label htmlFor="sku">SKU / Código</Label>
          <Input
            id="sku"
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            placeholder="ABC-001"
          />
        </div>

        {/* Activo */}
        <div className="flex items-center space-x-2">
          <Label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="h-4 w-4 rounded border-neutral-300"
            />
            Producto activo
          </Label>
        </div>

        {uploadError && (
          <p className="text-sm text-red-600 font-medium">{uploadError}</p>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => router.push("/dashboard/inventario")} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !form.name.trim() || form.price <= 0 || !form.categoryId}>
            {saving ? "Guardando..." : "Agregar producto"}
          </Button>
        </div>
      </div>
    );
  }

  // Step 1: Nombre
  if (step === 1) {
    return (
      <div>
        <div className="flex justify-end"><FormModeSwitch /></div>
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-8 text-center">Nombre del Producto</h2>
          <div className="w-full" onKeyDown={handleKeyDown}>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nombre del producto"
              autoFocus
              className="text-center"
            />
          </div>
          <div className="flex gap-3 mt-8">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/inventario")}
            >
              Cancelar
            </Button>
            <Button onClick={handleContinue} disabled={!canContinue()}>
              Continuar <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <ProgressBar />
        </div>
      </div>
    );
  }

  // Step 2: Precios
  if (step === 2) {
    return (
      <div>
        <div className="flex justify-end"><FormModeSwitch /></div>
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-8 text-center">Precios</h2>
        <div className="w-full max-w-md space-y-4" onKeyDown={handleKeyDown}>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-1">
              Precio de Costo (opcional)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-muted text-muted-foreground text-xs cursor-help border border-gray-400">
                      ?
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-700 text-white max-w-xs">
                    Precio al que el proveedor te vende este producto. Se usa para calcular tus utilidades netas mensuales.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="flex items-center gap-2">
              <PriceInput
                value={form.costPrice || 0}
                onChange={(costPrice) => setForm((f) => ({ ...f, costPrice }))}
                placeholder="$0"
              />
              <span className="text-muted-foreground text-sm whitespace-nowrap">en AR$</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Precio de Venta</Label>
            <div className="flex items-center gap-2">
              <PriceInput
                value={form.price}
                onChange={(price) => setForm((f) => ({ ...f, price }))}
                placeholder="$0"
                autoFocus
              />
              <span className="text-muted-foreground text-sm whitespace-nowrap">en AR$</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <Button variant="outline" onClick={() => setStep(1)}>
            <ChevronLeft className="h-4 w-4" /> Volver
          </Button>
          <Button onClick={handleContinue} disabled={!canContinue()}>
            Continuar <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <ProgressBar />
        </div>
      </div>
    );
  }

  // Step 3: Stock
  if (step === 3) {
    return (
      <div>
        <div className="flex justify-end"><FormModeSwitch /></div>
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-8 text-center">Stock Inicial</h2>
        <div className="w-full max-w-xs flex items-center gap-2" onKeyDown={handleKeyDown}>
          <Input
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
            autoFocus
            className="text-center"
          />
          <span className="text-muted-foreground text-sm">unidades</span>
        </div>
        <div className="flex gap-3 mt-8">
          <Button variant="outline" onClick={() => setStep(2)}>
            <ChevronLeft className="h-4 w-4" /> Volver
          </Button>
          <Button onClick={handleContinue} disabled={!canContinue()}>
            Continuar <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <ProgressBar />
        </div>
      </div>
    );
  }

  // Step 4: Categoría
  if (step === 4) {
    return (
      <div>
        <div className="flex justify-end"><FormModeSwitch /></div>
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-8 text-center">Categoría</h2>
          <div className="w-full max-w-xs">
            <CategorySelect
              storeId={storeId}
              value={form.categoryId || null}
              onChange={(categoryId) => setForm((f) => ({ ...f, categoryId: categoryId || undefined }))}
            />
          </div>
          <div className="flex gap-3 mt-8">
            <Button variant="outline" onClick={() => setStep(3)}>
              <ChevronLeft className="h-4 w-4" /> Volver
            </Button>
            <Button onClick={handleContinue} disabled={!canContinue()}>
              Continuar <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <ProgressBar />
        </div>
      </div>
    );
  }

  // Step 5: Resumen + Opcionales
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Resumen de datos obligatorios */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="font-semibold text-lg">Resumen del producto</h3>

        <div className="grid grid-cols-1 gap-y-2 text-sm">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <span className="text-muted-foreground">Nombre:</span>
              <span className="ml-2 font-medium">{form.name}</span>
            </div>
            <button type="button" onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground">
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <span className="text-muted-foreground">Precio de Costo:</span>
              <span className="ml-2 font-medium">{form.costPrice ? `$${form.costPrice.toLocaleString()}` : "-"}</span>
            </div>
            <button type="button" onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground">
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <span className="text-muted-foreground">Precio de Venta:</span>
              <span className="ml-2 font-medium">${form.price.toLocaleString()}</span>
            </div>
            <button type="button" onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground">
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <span className="text-muted-foreground">Stock:</span>
              <span className="ml-2 font-medium">{form.stock}</span>
            </div>
            <button type="button" onClick={() => setStep(3)} className="text-muted-foreground hover:text-foreground">
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <span className="text-muted-foreground">Categoría:</span>
              <span className="ml-2 font-medium">{categoryName}</span>
            </div>
            <button type="button" onClick={() => setStep(4)} className="text-muted-foreground hover:text-foreground">
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Campos opcionales */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Campos opcionales</h3>

        {/* Imagen */}
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

        {/* SKU */}
        <div className="space-y-2">
          <Label htmlFor="sku">SKU / Código</Label>
          <Input
            id="sku"
            value={form.sku}
            onChange={(e) =>
              setForm((f) => ({ ...f, sku: e.target.value }))
            }
            placeholder="ABC-001"
          />
        </div>

        {/* Activo */}
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
      </div>

      {uploadError && (
        <p className="text-sm text-red-600 font-medium">{uploadError}</p>
      )}

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={() => setStep(4)} disabled={saving}>
          <ChevronLeft className="h-4 w-4" /> Volver
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Agregar producto"}
        </Button>
      </div>

      <div className="flex justify-center">
        <ProgressBar />
      </div>
    </div>
  );
}
