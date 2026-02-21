"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDashboard } from "@/contexts/dashboard-context";
import type { StoreSettings } from "@/types/store-settings";
import type { Branch } from "@/types/branch";
import { LuUpload, LuLoaderCircle, LuCheck } from "react-icons/lu";
import { BranchFieldsSection } from "./branch-fields-section";

export function BrandingForm() {
  const { storeId, storeName, branchId } = useDashboard();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Store-level fields
  const [slug, setSlug] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [messageSignature, setMessageSignature] = useState("");
  const [unretrievedDays, setUnretrievedDays] = useState("7");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Branch-level fields
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
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
  const [phoneBranchRef, setPhoneBranchRef] = useState<string | null>(null);
  const [socialBranchRef, setSocialBranchRef] = useState<string | null>(null);
  const [hoursBranchRef, setHoursBranchRef] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const defaultSlug = storeName.trim().toLowerCase().replace(/\s+/g, "-");

      const [settingsRes, branchRes, branchesRes] = await Promise.all([
        fetch(`/api/store-settings?storeId=${storeId}`),
        fetch(`/api/branches/${branchId}`),
        fetch(`/api/branches?storeId=${storeId}`),
      ]);

      // Store-level from StoreSettings
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data) {
          setSettings(data);
          const savedSlug = data.slug;
          const isUuidSlug = savedSlug === storeId;
          setSlug(!savedSlug || isUuidSlug ? defaultSlug : savedSlug);
          setPrimaryColor(data.primaryColor ?? "#000000");
          setWelcomeMessage(data.welcomeMessage ?? "");
          setMessageSignature(data.messageSignature ?? "");
          setUnretrievedDays(String(data.unretrievedDays ?? 7));
          setLogoUrl(data.logoUrl);
        } else {
          setSlug(defaultSlug);
        }
      } else {
        setSlug(defaultSlug);
      }

      // All branches (for ref name resolution)
      if (branchesRes.ok) {
        const branches: Branch[] = await branchesRes.json();
        setAllBranches(branches);
      }

      // Branch-level from current branch
      if (branchRes.ok) {
        const branch: Branch = await branchRes.json();
        setCurrentBranch(branch);
        populateBranchFields(branch);
      }

      setLoading(false);
    }

    fetchData();
  }, [storeId, storeName, branchId]);

  function populateBranchFields(branch: Branch) {
    setGoogleMapsUrl(branch.googleMapsUrl ?? "");
    setWhatsappNumber(branch.whatsappNumber ?? "");
    setStoreAddress(branch.address ?? "");
    setFacebookUrl(branch.facebookUrl ?? "");
    setInstagramUrl(branch.instagramUrl ?? "");
    setTiktokUrl(branch.tiktokUrl ?? "");
    setTwitterUrl(branch.twitterUrl ?? "");
    setYoutubeUrl(branch.youtubeUrl ?? "");
    setPhoneBranchRef(branch.phoneBranchRef);
    setSocialBranchRef(branch.socialBranchRef);
    setHoursBranchRef(branch.hoursBranchRef);
    if (branch.businessHours) {
      try {
        const hours = JSON.parse(branch.businessHours);
        setHoursWeekdays(hours.weekdays ?? "");
        setHoursSaturday(hours.saturday ?? "");
        setHoursSunday(hours.sunday ?? "");
      } catch {
        setHoursWeekdays("");
        setHoursSaturday("");
        setHoursSunday("");
      }
    } else {
      setHoursWeekdays("");
      setHoursSaturday("");
      setHoursSunday("");
    }
  }

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
    } catch (err) {
      console.error("Error resolving address from Maps:", err);
    }
    setResolvingAddress(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const defaultSlug = storeName.trim().toLowerCase().replace(/\s+/g, "-");
    const finalSlug = slug.trim().toLowerCase().replace(/\s+/g, "-") || defaultSlug || storeId;
    const businessHours = hoursBranchRef
      ? null
      : JSON.stringify({
          weekdays: hoursWeekdays.trim() || null,
          saturday: hoursSaturday.trim() || null,
          sunday: hoursSunday.trim() || null,
        });

    // Branch-level payload
    const branchPayload = {
      googleMapsUrl: googleMapsUrl.trim() || null,
      address: storeAddress.trim() || null,
      whatsappNumber: phoneBranchRef ? null : whatsappNumber.trim() || null,
      businessHours,
      facebookUrl: socialBranchRef ? null : facebookUrl.trim() || null,
      instagramUrl: socialBranchRef ? null : instagramUrl.trim() || null,
      tiktokUrl: socialBranchRef ? null : tiktokUrl.trim() || null,
      twitterUrl: socialBranchRef ? null : twitterUrl.trim() || null,
      youtubeUrl: socialBranchRef ? null : youtubeUrl.trim() || null,
      phoneBranchRef,
      socialBranchRef,
      hoursBranchRef,
    };

    // Store-level payload (+ branch-level for backward compat if default branch)
    const storePayload: Record<string, unknown> = {
      storeId,
      slug: finalSlug,
      primaryColor,
      welcomeMessage: welcomeMessage.trim() || null,
      messageSignature: messageSignature.trim() || null,
      unretrievedDays: parseInt(unretrievedDays) || 7,
      logoUrl,
    };

    // If default branch, also save branch-level to StoreSettings for backward compat
    if (currentBranch?.isDefault) {
      storePayload.googleMapsUrl = branchPayload.googleMapsUrl;
      storePayload.storeAddress = branchPayload.address;
      storePayload.whatsappNumber = branchPayload.whatsappNumber;
      storePayload.businessHours = branchPayload.businessHours;
      storePayload.facebookUrl = branchPayload.facebookUrl;
      storePayload.instagramUrl = branchPayload.instagramUrl;
      storePayload.tiktokUrl = branchPayload.tiktokUrl;
      storePayload.twitterUrl = branchPayload.twitterUrl;
      storePayload.youtubeUrl = branchPayload.youtubeUrl;
    }

    try {
      const storeRes = await fetch("/api/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storePayload),
      });

      if (storeRes.ok) {
        const data = await storeRes.json();
        setSettings(data);
      } else {
        const data = await storeRes.json().catch(() => null);
        setError(data?.error || `Error ${storeRes.status} al guardar configuración`);
        setSaving(false);
        return;
      }

      if (branchId) {
        const branchRes = await fetch(`/api/branches/${branchId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(branchPayload),
        });

        if (!branchRes.ok) {
          const data = await branchRes.json().catch(() => null);
          setError(data?.error || `Error ${branchRes.status} al guardar sucursal`);
          setSaving(false);
          return;
        }
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Error de conexión al guardar");
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

      <BranchFieldsSection
        whatsappNumber={whatsappNumber}
        setWhatsappNumber={setWhatsappNumber}
        phoneBranchRef={phoneBranchRef}
        setPhoneBranchRef={setPhoneBranchRef}
        googleMapsUrl={googleMapsUrl}
        setGoogleMapsUrl={setGoogleMapsUrl}
        storeAddress={storeAddress}
        setStoreAddress={setStoreAddress}
        resolvingAddress={resolvingAddress}
        onMapsBlur={resolveAddressFromMaps}
        hoursWeekdays={hoursWeekdays}
        setHoursWeekdays={setHoursWeekdays}
        hoursSaturday={hoursSaturday}
        setHoursSaturday={setHoursSaturday}
        hoursSunday={hoursSunday}
        setHoursSunday={setHoursSunday}
        hoursBranchRef={hoursBranchRef}
        setHoursBranchRef={setHoursBranchRef}
        facebookUrl={facebookUrl}
        setFacebookUrl={setFacebookUrl}
        instagramUrl={instagramUrl}
        setInstagramUrl={setInstagramUrl}
        tiktokUrl={tiktokUrl}
        setTiktokUrl={setTiktokUrl}
        twitterUrl={twitterUrl}
        setTwitterUrl={setTwitterUrl}
        youtubeUrl={youtubeUrl}
        setYoutubeUrl={setYoutubeUrl}
        socialBranchRef={socialBranchRef}
        setSocialBranchRef={setSocialBranchRef}
        allBranches={allBranches}
        currentBranchId={branchId}
      />

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

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {success && (
        <p className="flex items-center gap-1.5 text-sm text-green-600">
          <LuCheck className="h-4 w-4" />
          Configuración guardada exitosamente
        </p>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? "Guardando..." : "Guardar Configuración"}
      </Button>
    </form>
  );
}
