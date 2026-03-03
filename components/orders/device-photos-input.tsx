"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LuCamera, LuX } from "react-icons/lu";

interface DevicePhotosInputProps {
  photos: File[];
  onChange: (photos: File[]) => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export function DevicePhotosInput({ photos, onChange }: DevicePhotosInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const fileArray = Array.from(files);
    const invalidFiles = fileArray.filter(f => !ALLOWED_TYPES.includes(f.type));
    if (invalidFiles.length > 0) {
      setError("Solo se permiten imágenes (JPG, PNG, WebP, HEIC)");
      return;
    }
    setError(null);
    const newPhotos = [...photos, ...fileArray];
    onChange(newPhotos);
  }

  function removePhoto(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <Label>Fotos del equipo</Label>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {photos.map((file, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={URL.createObjectURL(file)}
                alt={`Foto ${index + 1}`}
                className="h-full w-full object-cover rounded-md border"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute -top-1 -right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                <LuX className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        className="w-full"
      >
        <LuCamera className="mr-2 h-4 w-4" />
        Agregar fotos
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
