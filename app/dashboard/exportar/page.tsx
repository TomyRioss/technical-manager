"use client";

import { ExportPanel } from "@/components/export/export-panel";

export default function ExportarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Exportar Datos</h1>
      <p className="text-sm text-neutral-600">
        Descargá tus datos en Excel, CSV o JSON.
      </p>
      <ExportPanel />
    </div>
  );
}
