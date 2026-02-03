"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const commonFaults = [
  "Pantalla rota",
  "No enciende",
  "Batería",
  "Carga",
  "Audio",
  "Cámara",
  "Software",
  "Agua",
  "Placa",
  "Botones",
  "WiFi",
  "Señal",
];

interface FaultTagSelectorProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export function FaultTagSelector({ selected, onChange }: FaultTagSelectorProps) {
  const [custom, setCustom] = useState("");

  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  }

  function addCustom() {
    const trimmed = custom.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
      setCustom("");
    }
  }

  return (
    <div className="space-y-2">
      <Label>Etiquetas de falla</Label>
      <div className="flex flex-wrap gap-2">
        {commonFaults.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className={cn(
              "cursor-pointer transition-colors",
              selected.includes(tag)
                ? "bg-neutral-900 text-white border-neutral-900"
                : "hover:bg-neutral-100"
            )}
            onClick={() => toggle(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <Input
          placeholder="Agregar etiqueta personalizada..."
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          className="flex-1"
        />
      </div>
      {selected.filter((t) => !commonFaults.includes(t)).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {selected
            .filter((t) => !commonFaults.includes(t))
            .map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="bg-neutral-900 text-white border-neutral-900 cursor-pointer"
                onClick={() => toggle(tag)}
              >
                {tag} ×
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
}
