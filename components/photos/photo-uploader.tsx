"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { compressImage } from "@/lib/image-compressor";
import { LuCamera, LuLoaderCircle } from "react-icons/lu";

interface PhotoUploaderProps {
  orderId: string;
  onUploaded: (photo: { url: string; caption: string | null }) => void;
}

export function PhotoUploader({ orderId, onUploaded }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const compressed = await compressImage(file);

      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("orderId", orderId);

      const uploadRes = await fetch("/api/upload/order-photos", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => ({}));
        throw new Error(data.error || "Error al subir la foto");
      }
      const { url } = await uploadRes.json();

      const photoRes = await fetch(`/api/work-orders/${orderId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, caption: caption.trim() || null }),
      });

      if (!photoRes.ok) {
        const data = await photoRes.json().catch(() => ({}));
        throw new Error(data.error || "Error al guardar la foto");
      }

      const photo = await photoRes.json();
      onUploaded(photo);
      setCaption("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la foto");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Descripción de la foto (opcional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <LuLoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <LuCamera className="h-4 w-4" />
          )}
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
