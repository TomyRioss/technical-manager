"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LuLoaderCircle } from "react-icons/lu";

interface StepLocationProps {
  googleMapsUrl: string;
  storeAddress: string;
  onGoogleMapsUrlChange: (value: string) => void;
  onStoreAddressChange: (value: string) => void;
}

export function StepLocation({
  googleMapsUrl,
  storeAddress,
  onGoogleMapsUrlChange,
  onStoreAddressChange,
}: StepLocationProps) {
  const [resolving, setResolving] = useState(false);

  async function resolveAddress(url: string) {
    if (!url.trim()) return;
    setResolving(true);
    try {
      const res = await fetch("/api/resolve-maps-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.address && !storeAddress) {
          onStoreAddressChange(data.address);
        }
      }
    } catch {}
    setResolving(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-800">Ubicación</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Con este link se generará el mapa en tu catálogo y la dirección se mostrará al lado.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="mapsUrl">Link de Google Maps</Label>
        <Input
          id="mapsUrl"
          placeholder="https://maps.google.com/... o https://maps.app.goo.gl/..."
          value={googleMapsUrl}
          onChange={(e) => onGoogleMapsUrlChange(e.target.value)}
          onBlur={(e) => resolveAddress(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <div className="relative">
          <Textarea
            id="address"
            placeholder="Av. Ejemplo 1234, Ciudad"
            value={storeAddress}
            onChange={(e) => onStoreAddressChange(e.target.value)}
            rows={2}
          />
          {resolving && (
            <div className="absolute right-2 top-2">
              <LuLoaderCircle className="h-4 w-4 animate-spin text-neutral-400" />
            </div>
          )}
        </div>
        <p className="text-xs text-neutral-500">
          Se completa automáticamente al pegar el link de Google Maps.
        </p>
      </div>
    </div>
  );
}
