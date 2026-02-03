"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { OrderPhoto } from "@/types/work-order";

interface PhotoGalleryProps {
  photos: OrderPhoto[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selected, setSelected] = useState<OrderPhoto | null>(null);

  if (photos.length === 0) {
    return (
      <p className="text-sm text-neutral-500 py-2">No hay fotos cargadas.</p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setSelected(photo)}
            className="relative aspect-square rounded-lg overflow-hidden border border-border hover:opacity-90 transition-opacity"
          >
            <img
              src={photo.url}
              alt={photo.caption ?? "Foto del equipo"}
              className="w-full h-full object-cover"
            />
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                <p className="text-xs text-white truncate">{photo.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl p-0">
          {selected && (
            <div>
              <img
                src={selected.url}
                alt={selected.caption ?? "Foto del equipo"}
                className="w-full rounded-t-lg"
              />
              {selected.caption && (
                <p className="p-4 text-sm text-neutral-700">{selected.caption}</p>
              )}
              <p className="px-4 pb-4 text-xs text-neutral-500">
                {new Date(selected.takenAt).toLocaleString("es-AR")}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
