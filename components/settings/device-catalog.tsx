"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboard } from "@/contexts/dashboard-context";
import { DeviceBrandCard } from "./device-brand-card";
import { AddBrandModal } from "./add-brand-modal";
import { AddModelModal } from "./add-model-modal";
import { LuPlus, LuSearch } from "react-icons/lu";
import type { DeviceBrand } from "@/types/device";

export function DeviceCatalog() {
  const { storeId } = useDashboard();
  const [brands, setBrands] = useState<DeviceBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showAddBrand, setShowAddBrand] = useState(false);
  const [addModelBrand, setAddModelBrand] = useState<{ id: string; name: string } | null>(null);

  async function fetchBrands() {
    const res = await fetch(`/api/devices?storeId=${storeId}`);
    if (res.ok) {
      const data = await res.json();
      setBrands(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchBrands();
  }, [storeId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return brands;
    const q = search.toLowerCase();
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.models?.some((m) => m.name.toLowerCase().includes(q))
    );
  }, [brands, search]);

  if (loading) {
    return <p className="text-sm text-neutral-500">Cargando dispositivos...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Buscar marca o modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowAddBrand(true)} size="sm">
          <LuPlus className="h-4 w-4 mr-1" />
          Agregar marca
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-neutral-400">No se encontraron dispositivos</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((brand) => (
            <DeviceBrandCard
              key={brand.id}
              brand={brand}
              onAddModel={(brandId) => {
                const b = brands.find((br) => br.id === brandId);
                if (b) setAddModelBrand({ id: b.id, name: b.name });
              }}
              onRefresh={fetchBrands}
            />
          ))}
        </div>
      )}

      <AddBrandModal
        open={showAddBrand}
        onClose={() => setShowAddBrand(false)}
        storeId={storeId}
        onSuccess={fetchBrands}
      />

      {addModelBrand && (
        <AddModelModal
          open={!!addModelBrand}
          onClose={() => setAddModelBrand(null)}
          brandId={addModelBrand.id}
          brandName={addModelBrand.name}
          onSuccess={fetchBrands}
        />
      )}
    </div>
  );
}
