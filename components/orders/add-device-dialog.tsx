"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, Search } from "lucide-react";
import type { DeviceBrand } from "@/types/device";

interface AddDeviceDialogProps {
  open: boolean;
  onClose: () => void;
  storeId: string;
  onDeviceCreated: (displayName: string) => void;
}

type Step = "brand" | "model";

export function AddDeviceDialog({ open, onClose, storeId, onDeviceCreated }: AddDeviceDialogProps) {
  const [step, setStep] = useState<Step>("brand");
  const [brands, setBrands] = useState<DeviceBrand[]>([]);
  const [loading, setLoading] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");

  const [selectedBrand, setSelectedBrand] = useState<DeviceBrand | null>(null);

  // Crear marca inline
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [savingBrand, setSavingBrand] = useState(false);

  // Crear modelo inline
  const [showNewModel, setShowNewModel] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [savingModel, setSavingModel] = useState(false);

  useEffect(() => {
    if (open) {
      setStep("brand");
      setSelectedBrand(null);
      setBrandSearch("");
      setModelSearch("");
      setShowNewBrand(false);
      setShowNewModel(false);
      loadBrands();
    }
  }, [open]);

  async function loadBrands() {
    setLoading(true);
    const res = await fetch(`/api/devices?storeId=${storeId}`);
    if (res.ok) {
      const data = await res.json();
      setBrands(data);
    }
    setLoading(false);
  }

  function handleSelectBrand(brand: DeviceBrand) {
    setSelectedBrand(brand);
    setStep("model");
    setModelSearch("");
    setShowNewModel(false);
  }

  function handleSelectModel(modelName: string) {
    if (!selectedBrand) return;
    onDeviceCreated(`${selectedBrand.name} ${modelName}`);
    onClose();
  }

  async function handleCreateBrand(e: React.FormEvent) {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    setSavingBrand(true);
    const res = await fetch("/api/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId, name: newBrandName.trim() }),
    });
    if (res.ok) {
      const created = await res.json();
      const brand: DeviceBrand = { ...created, models: [] };
      setBrands((prev) => [...prev, brand].sort((a, b) => a.name.localeCompare(b.name)));
      setNewBrandName("");
      setShowNewBrand(false);
      handleSelectBrand(brand);
    }
    setSavingBrand(false);
  }

  async function handleCreateModel(e: React.FormEvent) {
    e.preventDefault();
    if (!newModelName.trim() || !selectedBrand) return;
    setSavingModel(true);
    const res = await fetch(`/api/devices/${selectedBrand.id}/models`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newModelName.trim() }),
    });
    if (res.ok) {
      handleSelectModel(newModelName.trim());
    }
    setSavingModel(false);
  }

  const filteredBrands = brandSearch.length >= 1
    ? brands.filter((b) => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
    : brands;

  const filteredModels = selectedBrand?.models
    ? modelSearch.length >= 1
      ? selectedBrand.models.filter((m) => m.name.toLowerCase().includes(modelSearch.toLowerCase()))
      : selectedBrand.models
    : [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "brand" ? "Seleccionar marca" : `${selectedBrand?.name} — Seleccionar modelo`}
          </DialogTitle>
        </DialogHeader>

        {step === "brand" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar marca..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {loading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Cargando...</p>
              ) : filteredBrands.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No se encontraron marcas</p>
              ) : (
                filteredBrands.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectBrand(b)}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-md text-sm cursor-pointer"
                  >
                    <span className="font-medium">{b.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {b.models?.length ?? 0} modelos
                    </span>
                  </button>
                ))
              )}
            </div>

            {showNewBrand ? (
              <form onSubmit={handleCreateBrand} className="flex gap-2 pt-2 border-t">
                <Input
                  placeholder="Nombre de la marca"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  autoFocus
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={savingBrand || !newBrandName.trim()}>
                  {savingBrand ? "..." : "Crear"}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowNewBrand(false)}>
                  Cancelar
                </Button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewBrand(true)}
                className="text-sm text-sky-500 hover:text-sky-600 hover:underline cursor-pointer pt-2 border-t w-full text-left"
              >
                + Crear nueva marca
              </button>
            )}
          </div>
        )}

        {step === "model" && selectedBrand && (
          <div className="space-y-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setStep("brand"); setSelectedBrand(null); }}
              className="px-0"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Cambiar marca
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar modelo..."
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredModels.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No hay modelos</p>
              ) : (
                filteredModels.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectModel(m.name)}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-md text-sm cursor-pointer"
                  >
                    {m.name}
                  </button>
                ))
              )}
            </div>

            {showNewModel ? (
              <form onSubmit={handleCreateModel} className="flex gap-2 pt-2 border-t">
                <Input
                  placeholder="Nombre del modelo"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  autoFocus
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={savingModel || !newModelName.trim()}>
                  {savingModel ? "..." : "Crear"}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowNewModel(false)}>
                  Cancelar
                </Button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewModel(true)}
                className="text-sm text-sky-500 hover:text-sky-600 hover:underline cursor-pointer pt-2 border-t w-full text-left"
              >
                + Crear nuevo modelo
              </button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
