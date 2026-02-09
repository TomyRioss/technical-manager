"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LuUpload, LuLoaderCircle } from "react-icons/lu";

interface StepLogoProps {
  storeId: string;
  logoUrl: string | null;
  onLogoChange: (url: string) => void;
}

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export function StepLogo({ storeId, logoUrl, onLogoChange }: StepLogoProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Formato no soportado. Usá PNG, JPG, WebP o SVG.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("storeId", storeId);

    const res = await fetch("/api/upload/logo", { method: "POST", body: formData });
    if (res.ok) {
      const { url } = await res.json();
      onLogoChange(url);
    } else {
      setError("Error al subir el logo. Intentá de nuevo.");
    }
    setUploading(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-800">Logo de tu tienda</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Se mostrará en tu catálogo y en el buscador de tus órdenes.
        </p>
      </div>
      <div className="space-y-3">
        <Label>Logo</Label>
        <div className="flex flex-col items-center gap-4">
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-24 object-contain rounded-md border border-border"
            />
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <><LuLoaderCircle className="h-4 w-4 animate-spin mr-1" /> Subiendo...</>
            ) : (
              <><LuUpload className="h-4 w-4 mr-1" /> {logoUrl ? "Cambiar logo" : "Subir logo"}</>
            )}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.svg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
