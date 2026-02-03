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
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const compressed = await compressImage(file);

      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("orderId", orderId);

      const uploadRes = await fetch("/api/upload/order-photos", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) return;
      const { url } = await uploadRes.json();

      const photoRes = await fetch(`/api/work-orders/${orderId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, caption: caption.trim() || null }),
      });

      if (photoRes.ok) {
        const photo = await photoRes.json();
        onUploaded(photo);
        setCaption("");
      }
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
    </div>
  );
}
