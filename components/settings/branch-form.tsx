"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { HoursSelector } from "@/components/settings/hours-selector";
import { BranchRefPicker } from "@/components/settings/branch-ref-picker";
import { Branch } from "@/types/branch";
import { LuBuilding2, LuX, LuLoaderCircle } from "react-icons/lu";

interface BranchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  userId: string;
  editBranch: Branch | null;
  allBranches: Branch[];
  onSuccess: () => void;
}

function parseBusinessHours(json: string | null) {
  if (!json) return { weekdays: "09:00-18:00", saturday: "09:00-13:00", sunday: "Cerrado" };
  try {
    const parsed = JSON.parse(json);
    return {
      weekdays: parsed.weekdays || "09:00-18:00",
      saturday: parsed.saturday || "09:00-13:00",
      sunday: parsed.sunday || "Cerrado",
    };
  } catch {
    return { weekdays: "09:00-18:00", saturday: "09:00-13:00", sunday: "Cerrado" };
  }
}

type RefType = "phone" | "social" | "hours";

export function BranchForm({
  open,
  onOpenChange,
  storeId,
  userId,
  editBranch,
  allBranches,
  onSuccess,
}: BranchFormProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [hoursWeekdays, setHoursWeekdays] = useState("09:00-18:00");
  const [hoursSaturday, setHoursSaturday] = useState("09:00-13:00");
  const [hoursSunday, setHoursSunday] = useState("Cerrado");
  const [phoneBranchRef, setPhoneBranchRef] = useState<string | null>(null);
  const [socialBranchRef, setSocialBranchRef] = useState<string | null>(null);
  const [hoursBranchRef, setHoursBranchRef] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [resolving, setResolving] = useState(false);
  const [pickerType, setPickerType] = useState<RefType | null>(null);

  const otherBranches = allBranches.filter((b) => b.id !== editBranch?.id);
  const phoneBranches = otherBranches.filter((b) => !b.phoneBranchRef);
  const socialBranches = otherBranches.filter((b) => !b.socialBranchRef);
  const hoursBranches = otherBranches.filter((b) => !b.hoursBranchRef);

  useEffect(() => {
    if (open && editBranch) {
      setName(editBranch.name);
      setAddress(editBranch.address ?? "");
      setGoogleMapsUrl(editBranch.googleMapsUrl ?? "");
      setWhatsappNumber(editBranch.whatsappNumber ?? "");
      setFacebookUrl(editBranch.facebookUrl ?? "");
      setInstagramUrl(editBranch.instagramUrl ?? "");
      setTiktokUrl(editBranch.tiktokUrl ?? "");
      setTwitterUrl(editBranch.twitterUrl ?? "");
      setYoutubeUrl(editBranch.youtubeUrl ?? "");
      setPhoneBranchRef(editBranch.phoneBranchRef);
      setSocialBranchRef(editBranch.socialBranchRef);
      setHoursBranchRef(editBranch.hoursBranchRef);
      const hours = parseBusinessHours(editBranch.businessHours);
      setHoursWeekdays(hours.weekdays);
      setHoursSaturday(hours.saturday);
      setHoursSunday(hours.sunday);
      setError("");
    }
  }, [editBranch, open]);

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
        if (data.address && !address) setAddress(data.address);
      }
    } catch {
      // user can fill manually
    }
    setResolving(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editBranch || !name.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setSaving(true);
    setError("");

    const businessHours = hoursBranchRef
      ? null
      : JSON.stringify({ weekdays: hoursWeekdays, saturday: hoursSaturday, sunday: hoursSunday });

    try {
      const res = await fetch(`/api/branches/${editBranch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim() || null,
          userId,
          googleMapsUrl: googleMapsUrl.trim() || null,
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
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "Error al guardar sucursal");
        setSaving(false);
        return;
      }

      onSuccess();
      onOpenChange(false);
    } catch {
      setError("Error de conexión");
    }
    setSaving(false);
  }

  const phoneRefBranch = phoneBranchRef ? otherBranches.find((b) => b.id === phoneBranchRef) : null;
  const socialRefBranch = socialBranchRef ? otherBranches.find((b) => b.id === socialBranchRef) : null;
  const hoursRefBranch = hoursBranchRef ? otherBranches.find((b) => b.id === hoursBranchRef) : null;

  function getPickerProps() {
    if (pickerType === "phone") {
      return {
        selectedBranchId: phoneBranchRef,
        onSelect: (b: Branch) => setPhoneBranchRef(b.id),
        title: "Seleccionar sucursal",
        description: "El teléfono de la sucursal seleccionada se usará para esta.",
        renderDetail: (b: Branch) => b.whatsappNumber || b.phone || "Sin teléfono",
      };
    }
    if (pickerType === "social") {
      return {
        selectedBranchId: socialBranchRef,
        onSelect: (b: Branch) => setSocialBranchRef(b.id),
        title: "Seleccionar sucursal",
        description: "Las redes sociales de la sucursal seleccionada se usarán para esta.",
        renderDetail: (b: Branch) => {
          const count = [b.facebookUrl, b.instagramUrl, b.tiktokUrl, b.twitterUrl, b.youtubeUrl].filter(Boolean).length;
          return count > 0 ? `${count} red${count > 1 ? "es" : ""} configurada${count > 1 ? "s" : ""}` : "Sin redes";
        },
      };
    }
    return {
      selectedBranchId: hoursBranchRef,
      onSelect: (b: Branch) => setHoursBranchRef(b.id),
      title: "Seleccionar sucursal",
      description: "Los horarios de la sucursal seleccionada se usarán para esta.",
      renderDetail: (b: Branch) => {
        if (!b.businessHours) return "Sin horarios";
        try {
          const p = JSON.parse(b.businessHours);
          return `L-V: ${p.weekdays || "—"}, Sáb: ${p.saturday || "—"}`;
        } catch { return "Sin horarios"; }
      },
    };
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle>Editar Sucursal</SheetTitle>
            <SheetDescription>Modificá la configuración de esta sucursal.</SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
            {/* General */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide">General</h3>
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Sucursal Centro" />
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <div className="relative">
                  <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Av. Ejemplo 1234, Ciudad" rows={2} />
                  {resolving && (
                    <div className="absolute right-2 top-2">
                      <LuLoaderCircle className="h-4 w-4 animate-spin text-neutral-400" />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Ubicación */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide">Ubicación</h3>
              <div className="space-y-2">
                <Label>Link de Google Maps</Label>
                <Input
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  onBlur={(e) => resolveAddress(e.target.value)}
                  placeholder="https://maps.google.com/..."
                />
                <p className="text-xs text-neutral-500">La dirección se completa automáticamente al pegar el link.</p>
              </div>
            </section>

            {/* Teléfono */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide">Teléfono</h3>
              {phoneRefBranch ? (
                <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  <LuBuilding2 className="h-4 w-4 text-neutral-500 shrink-0" />
                  <span className="text-sm text-neutral-700 flex-1">Usando teléfono de <strong>{phoneRefBranch.name}</strong></span>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPhoneBranchRef(null)}>
                    <LuX className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Número de WhatsApp</Label>
                  <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="Ej: +54 11 1234-5678" />
                </div>
              )}
              {phoneBranches.length > 0 && !phoneRefBranch && (
                <button type="button" onClick={() => setPickerType("phone")} className="text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-700 transition-colors">
                  Usar teléfono de otra sucursal
                </button>
              )}
            </section>

            {/* Redes sociales */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide">Redes sociales</h3>
              {socialRefBranch ? (
                <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  <LuBuilding2 className="h-4 w-4 text-neutral-500 shrink-0" />
                  <span className="text-sm text-neutral-700 flex-1">Usando redes de <strong>{socialRefBranch.name}</strong></span>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSocialBranchRef(null)}>
                    <LuX className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="space-y-2">
                    <Label>Facebook</Label>
                    <Input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/tu-pagina" />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/tu-cuenta" />
                  </div>
                  <div className="space-y-2">
                    <Label>TikTok</Label>
                    <Input value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} placeholder="https://tiktok.com/@tu-cuenta" />
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter / X</Label>
                    <Input value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://x.com/tu-cuenta" />
                  </div>
                  <div className="space-y-2">
                    <Label>YouTube</Label>
                    <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/@tu-canal" />
                  </div>
                </div>
              )}
              {socialBranches.length > 0 && !socialRefBranch && (
                <button type="button" onClick={() => setPickerType("social")} className="text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-700 transition-colors">
                  Copiar redes de otra sucursal
                </button>
              )}
            </section>

            {/* Horarios */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide">Horarios</h3>
              {hoursRefBranch ? (
                <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  <LuBuilding2 className="h-4 w-4 text-neutral-500 shrink-0" />
                  <span className="text-sm text-neutral-700 flex-1">Usando horarios de <strong>{hoursRefBranch.name}</strong></span>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setHoursBranchRef(null)}>
                    <LuX className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  <HoursSelector label="Lunes a Viernes" value={hoursWeekdays} onChange={setHoursWeekdays} />
                  <HoursSelector label="Sábado" value={hoursSaturday} onChange={setHoursSaturday} />
                  <HoursSelector label="Domingo" value={hoursSunday} onChange={setHoursSunday} />
                </div>
              )}
              {hoursBranches.length > 0 && !hoursRefBranch && (
                <button type="button" onClick={() => setPickerType("hours")} className="text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-700 transition-colors">
                  Copiar horarios de otra sucursal
                </button>
              )}
            </section>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {pickerType && (
        <BranchRefPicker
          open={!!pickerType}
          onOpenChange={(open) => { if (!open) setPickerType(null); }}
          branches={pickerType === "phone" ? phoneBranches : pickerType === "social" ? socialBranches : hoursBranches}
          {...getPickerProps()}
        />
      )}
    </>
  );
}
