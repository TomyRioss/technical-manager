"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepNameProps {
  name: string;
  onChange: (value: string) => void;
}

export function StepName({ name, onChange }: StepNameProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-800">Nombre de la sucursal</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Elegí un nombre que identifique esta sucursal.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="branch-name">Nombre *</Label>
        <Input
          id="branch-name"
          placeholder="Ej: Sucursal Centro"
          value={name}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
      </div>
    </div>
  );
}
