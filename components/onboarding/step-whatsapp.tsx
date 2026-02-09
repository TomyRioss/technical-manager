"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepWhatsappProps {
  value: string;
  onChange: (value: string) => void;
}

export function StepWhatsapp({ value, onChange }: StepWhatsappProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-800">WhatsApp de tu tienda</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Los usuarios serán redirigidos a este número en tu catálogo.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsapp">Número de WhatsApp *</Label>
        <Input
          id="whatsapp"
          placeholder="5491112345678"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />
        <p className="text-xs text-neutral-500">
          Código de país + número, sin espacios ni guiones.
        </p>
      </div>
    </div>
  );
}
