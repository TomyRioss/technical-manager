"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LuChevronDown, LuChevronRight, LuPlus, LuPencil, LuTrash2, LuCheck, LuX } from "react-icons/lu";
import type { DeviceBrand, DeviceModelItem } from "@/types/device";

interface DeviceBrandCardProps {
  brand: DeviceBrand;
  onAddModel: (brandId: string) => void;
  onRefresh: () => void;
}

function ModelRow({ model, brandId, onRefresh }: { model: DeviceModelItem; brandId: string; onRefresh: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(model.name);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim() || name.trim() === model.name) {
      setEditing(false);
      setName(model.name);
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/devices/${brandId}/models`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelId: model.id, name: name.trim() }),
    });
    if (res.ok) {
      setEditing(false);
      onRefresh();
    }
    setSaving(false);
  }

  async function handleDelete() {
    const res = await fetch(`/api/devices/${brandId}/models?modelId=${model.id}`, {
      method: "DELETE",
    });
    if (res.ok) onRefresh();
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-50">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-7 text-sm flex-1"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") { setEditing(false); setName(model.name); }
          }}
          disabled={saving}
        />
        <button type="button" onClick={handleSave} disabled={saving} className="text-green-600 hover:text-green-700 p-0.5">
          <LuCheck className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={() => { setEditing(false); setName(model.name); }} className="text-neutral-400 hover:text-neutral-600 p-0.5">
          <LuX className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-1 px-2 py-1 rounded bg-neutral-50">
      <span className="text-sm text-neutral-700 flex-1">{model.name}</span>
      <button type="button" onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-600 p-0.5 transition-opacity">
        <LuPencil className="h-3 w-3" />
      </button>
      <button type="button" onClick={handleDelete} className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 p-0.5 transition-opacity">
        <LuTrash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

export function DeviceBrandCard({ brand, onAddModel, onRefresh }: DeviceBrandCardProps) {
  const [expanded, setExpanded] = useState(false);
  const models = brand.models ?? [];

  return (
    <div className="border border-border rounded-md">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-neutral-50 transition-colors"
      >
        {expanded ? (
          <LuChevronDown className="h-4 w-4 text-neutral-500" />
        ) : (
          <LuChevronRight className="h-4 w-4 text-neutral-500" />
        )}
        <span className="font-medium text-sm">{brand.name}</span>
        <span className="text-xs text-neutral-400 ml-1">
          ({models.length} {models.length === 1 ? "modelo" : "modelos"})
        </span>
        {brand.isGlobal ? (
          <span className="ml-auto text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">
            Global
          </span>
        ) : (
          <span className="ml-auto text-xs bg-sky-50 text-sky-600 px-2 py-0.5 rounded">
            Personalizado
          </span>
        )}
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-2">
          {models.length === 0 ? (
            <p className="text-sm text-neutral-400">Sin modelos</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
              {models.map((model) => (
                <ModelRow key={model.id} model={model} brandId={brand.id} onRefresh={onRefresh} />
              ))}
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onAddModel(brand.id)}
            className="text-sky-600 hover:text-sky-700 mt-2"
          >
            <LuPlus className="h-3 w-3 mr-1" />
            Agregar modelo
          </Button>
        </div>
      )}
    </div>
  );
}
