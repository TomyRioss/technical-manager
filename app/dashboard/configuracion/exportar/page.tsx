"use client";

import { ExportPanel } from "@/components/export/export-panel";

export default function ExportarPage() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-600">
        Descargá tus datos en Excel, CSV o JSON.
      </p>
      <ExportPanel />
    </div>
  );
}
