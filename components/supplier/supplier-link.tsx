"use client";

import { Button } from "@/components/ui/button";
import { LuExternalLink } from "react-icons/lu";

interface SupplierLinkProps {
  deviceModel: string;
}

const suppliers = [
  {
    name: "MercadoLibre",
    buildUrl: (q: string) => `https://listado.mercadolibre.com.ar/${encodeURIComponent(q)}`,
  },
  {
    name: "Google Shopping",
    buildUrl: (q: string) =>
      `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q + " repuesto")}`,
  },
];

export function SupplierLink({ deviceModel }: SupplierLinkProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {suppliers.map((s) => (
        <Button
          key={s.name}
          variant="outline"
          size="sm"
          disabled
        >
          <LuExternalLink className="h-3 w-3 mr-1" />
          {s.name}
        </Button>
      ))}
      <span className="text-xs text-neutral-500">Próximamente...</span>
    </div>
  );
}
