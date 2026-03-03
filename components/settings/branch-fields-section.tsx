"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HoursSelector } from "./hours-selector";
import { LuBuilding2, LuX, LuLoaderCircle, LuChevronDown, LuChevronUp } from "react-icons/lu";
import type { Branch } from "@/types/branch";

function DependentBranchesBadge({ allBranches, currentBranchId, refField, label }: {
  allBranches: Branch[];
  currentBranchId: string;
  refField: "phoneBranchRef" | "hoursBranchRef" | "socialBranchRef";
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const dependents = allBranches.filter((b) => b[refField] === currentBranchId);
  if (dependents.length === 0) return null;

  return (
    <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-blue-700 font-medium cursor-pointer w-full"
      >
        <LuBuilding2 className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">
          {dependents.length} sucursal{dependents.length > 1 ? "es" : ""} usa{dependents.length > 1 ? "n" : ""} este {label}
        </span>
        {open ? <LuChevronUp className="h-3.5 w-3.5" /> : <LuChevronDown className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <ul className="mt-2 ml-6 space-y-1">
          {dependents.map((b) => (
            <li key={b.id} className="text-sm text-blue-600">{b.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface BranchFieldsSectionProps {
  // Phone
  whatsappNumber: string;
  setWhatsappNumber: (v: string) => void;
  phoneBranchRef: string | null;
  setPhoneBranchRef: (v: string | null) => void;
  // Location
  googleMapsUrl: string;
  setGoogleMapsUrl: (v: string) => void;
  storeAddress: string;
  setStoreAddress: (v: string) => void;
  resolvingAddress: boolean;
  onMapsBlur: (url: string) => void;
  // Hours
  hoursWeekdays: string;
  setHoursWeekdays: (v: string) => void;
  hoursSaturday: string;
  setHoursSaturday: (v: string) => void;
  hoursSunday: string;
  setHoursSunday: (v: string) => void;
  hoursBranchRef: string | null;
  setHoursBranchRef: (v: string | null) => void;
  // Social
  facebookUrl: string;
  setFacebookUrl: (v: string) => void;
  instagramUrl: string;
  setInstagramUrl: (v: string) => void;
  tiktokUrl: string;
  setTiktokUrl: (v: string) => void;
  twitterUrl: string;
  setTwitterUrl: (v: string) => void;
  youtubeUrl: string;
  setYoutubeUrl: (v: string) => void;
  socialBranchRef: string | null;
  setSocialBranchRef: (v: string | null) => void;
  // Branches for ref resolution
  allBranches: Branch[];
  currentBranchId: string;
}

function RefBanner({ refId, allBranches, label, onClear }: {
  refId: string;
  allBranches: Branch[];
  label: string;
  onClear: () => void;
}) {
  const refBranch = allBranches.find((b) => b.id === refId);
  if (!refBranch) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
      <LuBuilding2 className="h-4 w-4 text-neutral-500 shrink-0" />
      <span className="text-sm text-neutral-700 flex-1">
        Usando {label} de <strong>{refBranch.name}</strong>
      </span>
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onClear}>
        <LuX className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function BranchFieldsSection(props: BranchFieldsSectionProps) {
  const {
    whatsappNumber, setWhatsappNumber, phoneBranchRef, setPhoneBranchRef,
    googleMapsUrl, setGoogleMapsUrl, storeAddress, setStoreAddress,
    resolvingAddress, onMapsBlur,
    hoursWeekdays, setHoursWeekdays, hoursSaturday, setHoursSaturday,
    hoursSunday, setHoursSunday, hoursBranchRef, setHoursBranchRef,
    facebookUrl, setFacebookUrl, instagramUrl, setInstagramUrl,
    tiktokUrl, setTiktokUrl, twitterUrl, setTwitterUrl,
    youtubeUrl, setYoutubeUrl, socialBranchRef, setSocialBranchRef,
    allBranches, currentBranchId,
  } = props;

  return (
    <>
      {/* WhatsApp */}
      <div className="space-y-2">
        <Label htmlFor="whatsappNumber">Número de WhatsApp</Label>
        {phoneBranchRef ? (
          <RefBanner refId={phoneBranchRef} allBranches={allBranches} label="teléfono" onClear={() => setPhoneBranchRef(null)} />
        ) : (
          <>
            <Input
              id="whatsappNumber"
              placeholder="5491112345678"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
            />
            <p className="text-xs text-neutral-500">
              Código de país + número, sin espacios ni guiones. Se usa en la tienda pública.
            </p>
            <DependentBranchesBadge allBranches={allBranches} currentBranchId={currentBranchId} refField="phoneBranchRef" label="teléfono" />
          </>
        )}
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
          onBlur={(e) => onMapsBlur(e.target.value)}
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
            placeholder={"Av. Ejemplo 1234, Local 45\nCiudad, País"}
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

      {/* Horarios */}
      <div className="space-y-2">
        <Label>Horarios de atención</Label>
        {hoursBranchRef ? (
          <RefBanner refId={hoursBranchRef} allBranches={allBranches} label="horarios" onClear={() => setHoursBranchRef(null)} />
        ) : (
          <>
            <div className="space-y-4">
              <HoursSelector label="Lunes a Viernes" value={hoursWeekdays} onChange={setHoursWeekdays} />
              <HoursSelector label="Sábado" value={hoursSaturday} onChange={setHoursSaturday} />
              <HoursSelector label="Domingo" value={hoursSunday} onChange={setHoursSunday} />
            </div>
            <DependentBranchesBadge allBranches={allBranches} currentBranchId={currentBranchId} refField="hoursBranchRef" label="horarios" />
          </>
        )}
      </div>

      <hr className="my-4" />
      <h3 className="font-semibold text-neutral-800">Redes Sociales</h3>
      <p className="text-sm text-neutral-500 mb-4">
        Links a tus redes sociales que aparecerán en el footer de tu tienda pública.
      </p>

      {socialBranchRef ? (
        <RefBanner refId={socialBranchRef} allBranches={allBranches} label="redes sociales" onClear={() => setSocialBranchRef(null)} />
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="facebookUrl">Facebook</Label>
            <Input id="facebookUrl" placeholder="https://facebook.com/tu-pagina" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagramUrl">Instagram</Label>
            <Input id="instagramUrl" placeholder="https://instagram.com/tu-cuenta" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tiktokUrl">TikTok</Label>
            <Input id="tiktokUrl" placeholder="https://tiktok.com/@tu-cuenta" value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitterUrl">Twitter / X</Label>
            <Input id="twitterUrl" placeholder="https://x.com/tu-cuenta" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtubeUrl">YouTube</Label>
            <Input id="youtubeUrl" placeholder="https://youtube.com/@tu-canal" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
          </div>
          <DependentBranchesBadge allBranches={allBranches} currentBranchId={currentBranchId} refField="socialBranchRef" label="redes sociales" />
        </>
      )}
    </>
  );
}
