"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDashboard } from "@/contexts/dashboard-context";
import type { StoreSettings } from "@/types/store-settings";
import { LuUpload, LuLoaderCircle } from "react-icons/lu";
import { HoursSelector } from "./hours-selector";

export function BrandingForm() {
  const { storeId, storeName } = useDashboard();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [messageSignature, setMessageSignature] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [unretrievedDays, setUnretrievedDays] = useState("7");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [hoursWeekdays, setHoursWeekdays] = useState("");
  const [hoursSaturday, setHoursSaturday] = useState("");
  const [hoursSunday, setHoursSunday] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      const res = await fetch(`/api/store-settings?storeId=${storeId}`);
      const defaultSlug = storeName.trim().toLowerCase().replace(/\s+/g, "-");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setSettings(data);
          // Si el slug es el storeId (UUID) o está vacío, usar storeName como default
          const savedSlug = data.slug;
          const isUuidSlug = savedSlug === storeId;
          setSlug(!savedSlug || isUuidSlug ? defaultSlug : savedSlug);
          setPrimaryColor(data.primaryColor ?? "#000000");
          setWelcomeMessage(data.welcomeMessage ?? "");
          setMessageSignature(data.messageSignature ?? "");
          setGoogleMapsUrl(data.googleMapsUrl ?? "");
          setWhatsappNumber(data.whatsappNumber ?? "");
          setUnretrievedDays(String(data.unretrievedDays ?? 7));
          setLogoUrl(data.logoUrl);
          setFacebookUrl(data.facebookUrl ?? "");
          setInstagramUrl(data.instagramUrl ?? "");
          setTiktokUrl(data.tiktokUrl ?? "");
          setTwitterUrl(data.twitterUrl ?? "");
          setYoutubeUrl(data.youtubeUrl ?? "");
          setStoreAddress(data.storeAddress ?? "");
          if (data.businessHours) {
            try {
              const hours = JSON.parse(data.businessHours);
              setHoursWeekdays(hours.weekdays ?? "");
              setHoursSaturday(hours.saturday ?? "");
              setHoursSunday(hours.sunday ?? "");
            } catch {
              // ignore
            }
          }
        } else {
          setSlug(defaultSlug);
        }
      } else {
        setSlug(defaultSlug);
      }
      setLoading(false);
    }
    fetchSettings();
  }, [storeId, storeName]);

  const [logoError, setLogoError] = useState<string | null>(null);
  const allowedLogoTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

  async function handleLogoUpload(file: File) {
    setLogoError(null);

    if (!allowedLogoTypes.includes(file.type)) {
      setLogoError("Formato no soportado. Usá PNG, JPG, WebP o SVG.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("storeId", storeId);

    const res = await fetch("/api/upload/logo", { method: "POST", body: formData });
    if (res.ok) {
      const { url } = await res.json();
      setLogoUrl(url);
    } else {
      setLogoError("Error al subir el logo. Intentá de nuevo.");
    }
    setUploading(false);
  }

  async function resolveAddressFromMaps(url: string) {
    if (!url.trim()) return;
    setResolvingAddress(true);
    try {
      const res = await fetch("/api/resolve-maps-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.address && !storeAddress) {
          setStoreAddress(data.address);
        }
      }
    } catch {}
    setResolvingAddress(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError(null);
    const defaultSlug = storeName.trim().toLowerCase().replace(/\s+/g, "-");
    const finalSlug = slug.trim().toLowerCase().replace(/\s+/g, "-") || defaultSlug || storeId;
    const businessHours = JSON.stringify({
      weekdays: hoursWeekdays.trim() || null,
      saturday: hoursSaturday.trim() || null,
      sunday: hoursSunday.trim() || null,
    });
    const res = await fetch("/api/store-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        slug: finalSlug,
        primaryColor,
        welcomeMessage: welcomeMessage.trim() || null,
        messageSignature: messageSignature.trim() || null,
        googleMapsUrl: googleMapsUrl.trim() || null,
        storeAddress: storeAddress.trim() || null,
        whatsappNumber: whatsappNumber.trim() || null,
        unretrievedDays: parseInt(unretrievedDays) || 7,
        logoUrl,
        businessHours,
        facebookUrl: facebookUrl.trim() || null,
        instagramUrl: instagramUrl.trim() || null,
        tiktokUrl: tiktokUrl.trim() || null,
        twitterUrl: twitterUrl.trim() || null,
        youtubeUrl: youtubeUrl.trim() || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setSettings(data);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error || `Error ${res.status}`);
    }
    setSaving(false);
  }

  if (loading) return <p className="text-sm text-neutral-500">Cargando configuración...</p>;

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-xl" noValidate>
      <div className="space-y-2">
        <Label>Logo</Label>
        <div className="flex items-center gap-4">
          {logoUrl && (
            <img src={logoUrl} alt="Logo" className="h-16 object-contain rounded-md border border-border" />
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <LuLoaderCircle className="h-4 w-4 animate-spin mr-1" /> : <LuUpload className="h-4 w-4 mr-1" />}
            {uploading ? "Subiendo..." : "Subir Logo"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.svg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleLogoUpload(file);
            }}
          />
        </div>
        {logoError && <p className="text-sm text-red-600">{logoError}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL pública) *</Label>
        <Input
          id="slug"
          placeholder="mi-local"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
        <p className="text-xs text-neutral-500">
          Seguimiento: https://koldesk.com/{slug || "mi-local"} — Tienda: https://koldesk.com/{slug || "mi-local"}/tienda
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="primaryColor">Color principal</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="h-10 w-10 rounded border border-border cursor-pointer"
          />
          <Input
            id="primaryColor"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-32"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="welcomeMessage">Mensaje de bienvenida</Label>
        <Textarea
          id="welcomeMessage"
          placeholder="Bienvenido a nuestro servicio técnico..."
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="messageSignature">Firma de mensajes</Label>
        <Input
          id="messageSignature"
          placeholder="Equipo de Servicio Técnico XYZ"
          value={messageSignature}
          onChange={(e) => setMessageSignature(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsappNumber">Número de WhatsApp</Label>
        <Input
          id="whatsappNumber"
          placeholder="5491112345678"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
        />
        <p className="text-xs text-neutral-500">
          Código de país + número, sin espacios ni guiones. Se usa en la tienda pública.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unretrievedDays">Días para alerta de equipo sin retirar</Label>
        <Input
          id="unretrievedDays"
          type="number"
          min="1"
          value={unretrievedDays}
          onChange={(e) => setUnretrievedDays(e.target.value)}
          className="w-24"
        />
      </div>

      <hr className="my-4" />
      <h3 className="font-semibold text-neutral-800">Tienda Pública - Ubicación</h3>

      <div className="space-y-2">
        <Label htmlFor="googleMapsUrl">Link de Google Maps</Label>
        <Input
          id="googleMapsUrl"
          placeholder="https://maps.google.com/... o https://maps.app.goo.gl/..."
          value={googleMapsUrl}
          onChange={(e) => setGoogleMapsUrl(e.target.value)}
          onBlur={(e) => resolveAddressFromMaps(e.target.value)}
        />
        <p className="text-xs text-neutral-500">
          Pegá el link de tu ubicación en Google Maps. Se mostrará el mapa en la tienda pública.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="storeAddress">Dirección</Label>
        <div className="relative">
          <Textarea
            id="storeAddress"
            placeholder="Av. Ejemplo 1234, Local 45&#10;Ciudad, País"
            value={storeAddress}
            onChange={(e) => setStoreAddress(e.target.value)}
            rows={2}
          />
          {resolvingAddress && (
            <div className="absolute right-2 top-2">
              <LuLoaderCircle className="h-4 w-4 animate-spin text-neutral-400" />
            </div>
          )}
        </div>
        <p className="text-xs text-neutral-500">
          Se completa automáticamente al pegar el link de Google Maps. Podés editarla manualmente.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Horarios de atención</Label>
        <div className="space-y-4">
          <HoursSelector
            label="Lunes a Viernes"
            value={hoursWeekdays}
            onChange={setHoursWeekdays}
          />
          <HoursSelector
            label="Sábado"
            value={hoursSaturday}
            onChange={setHoursSaturday}
          />
          <HoursSelector
            label="Domingo"
            value={hoursSunday}
            onChange={setHoursSunday}
          />
        </div>
      </div>

      <hr className="my-4" />
      <h3 className="font-semibold text-neutral-800">Redes Sociales</h3>
      <p className="text-sm text-neutral-500 mb-4">
        Links a tus redes sociales que aparecerán en el footer de tu tienda pública.
      </p>

      <div className="space-y-2">
        <Label htmlFor="facebookUrl">Facebook</Label>
        <Input
          id="facebookUrl"
          placeholder="https://facebook.com/tu-pagina"
          value={facebookUrl}
          onChange={(e) => setFacebookUrl(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instagramUrl">Instagram</Label>
        <Input
          id="instagramUrl"
          placeholder="https://instagram.com/tu-cuenta"
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tiktokUrl">TikTok</Label>
        <Input
          id="tiktokUrl"
          placeholder="https://tiktok.com/@tu-cuenta"
          value={tiktokUrl}
          onChange={(e) => setTiktokUrl(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="twitterUrl">Twitter / X</Label>
        <Input
          id="twitterUrl"
          placeholder="https://x.com/tu-cuenta"
          value={twitterUrl}
          onChange={(e) => setTwitterUrl(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="youtubeUrl">YouTube</Label>
        <Input
          id="youtubeUrl"
          placeholder="https://youtube.com/@tu-canal"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? "Guardando..." : "Guardar Configuración"}
      </Button>
    </form>
  );
}
