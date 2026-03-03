"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Branch } from "@/types/branch";
import { StepName } from "@/components/settings/branch-steps/step-name";
import { StepLocation } from "@/components/settings/branch-steps/step-location";
import { StepPhone } from "@/components/settings/branch-steps/step-phone";
import { StepSocial } from "@/components/settings/branch-steps/step-social";
import { StepHours } from "@/components/settings/branch-steps/step-hours";

const STEP_LABELS = ["Nombre", "Ubicación", "Teléfono", "Redes", "Horarios"];
const TOTAL_STEPS = STEP_LABELS.length;

interface BranchOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  userId: string;
  existingBranches: Branch[];
  onSuccess: () => void;
}

interface FormData {
  name: string;
  googleMapsUrl: string;
  address: string;
  whatsappNumber: string;
  phoneBranchRef: string | null;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  socialBranchRef: string | null;
  hoursWeekdays: string;
  hoursSaturday: string;
  hoursSunday: string;
  hoursBranchRef: string | null;
}

const INITIAL_DATA: FormData = {
  name: "",
  googleMapsUrl: "",
  address: "",
  whatsappNumber: "",
  phoneBranchRef: null,
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  twitterUrl: "",
  youtubeUrl: "",
  socialBranchRef: null,
  hoursWeekdays: "09:00-18:00",
  hoursSaturday: "09:00-13:00",
  hoursSunday: "Cerrado",
  hoursBranchRef: null,
};

export function BranchOnboarding({
  open,
  onOpenChange,
  storeId,
  userId,
  existingBranches,
  onSuccess,
}: BranchOnboardingProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({ ...INITIAL_DATA });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setStep(0);
    setData({ ...INITIAL_DATA });
    setError("");
    setSaving(false);
  }

  function handleOpenChange(open: boolean) {
    if (!open) resetForm();
    onOpenChange(open);
  }

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function canGoNext(): boolean {
    if (step === 0 && !data.name.trim()) return false;
    return true;
  }

  async function handleCreate() {
    if (!data.name.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setSaving(true);
    setError("");

    const businessHours = data.hoursBranchRef
      ? null
      : JSON.stringify({
          weekdays: data.hoursWeekdays,
          saturday: data.hoursSaturday,
          sunday: data.hoursSunday,
        });

    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name.trim(),
          address: data.address.trim() || null,
          storeId,
          userId,
          googleMapsUrl: data.googleMapsUrl.trim() || null,
          whatsappNumber: data.phoneBranchRef ? null : data.whatsappNumber.trim() || null,
          businessHours,
          facebookUrl: data.socialBranchRef ? null : data.facebookUrl.trim() || null,
          instagramUrl: data.socialBranchRef ? null : data.instagramUrl.trim() || null,
          tiktokUrl: data.socialBranchRef ? null : data.tiktokUrl.trim() || null,
          twitterUrl: data.socialBranchRef ? null : data.twitterUrl.trim() || null,
          youtubeUrl: data.socialBranchRef ? null : data.youtubeUrl.trim() || null,
          phoneBranchRef: data.phoneBranchRef,
          socialBranchRef: data.socialBranchRef,
          hoursBranchRef: data.hoursBranchRef,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "Error al crear sucursal");
        setSaving(false);
        return;
      }

      onSuccess();
      handleOpenChange(false);
    } catch {
      setError("Error de conexión");
    }
    setSaving(false);
  }

  const progressValue = ((step + 1) / TOTAL_STEPS) * 100;
  const isLastStep = step === TOTAL_STEPS - 1;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="border-b border-neutral-200 px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold">Nueva Sucursal</h2>
          <p className="text-sm text-muted-foreground">
            Paso {step + 1} de {TOTAL_STEPS}: {STEP_LABELS[step]}
          </p>
          <Progress value={progressValue} className="mt-2" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {step === 0 && (
            <StepName
              name={data.name}
              onChange={(v) => updateField("name", v)}
            />
          )}
          {step === 1 && (
            <StepLocation
              googleMapsUrl={data.googleMapsUrl}
              address={data.address}
              onGoogleMapsUrlChange={(v) => updateField("googleMapsUrl", v)}
              onAddressChange={(v) => updateField("address", v)}
            />
          )}
          {step === 2 && (
            <StepPhone
              whatsappNumber={data.whatsappNumber}
              phoneBranchRef={data.phoneBranchRef}
              branches={existingBranches}
              onWhatsappChange={(v) => updateField("whatsappNumber", v)}
              onPhoneRefChange={(v) => updateField("phoneBranchRef", v)}
            />
          )}
          {step === 3 && (
            <StepSocial
              social={{
                facebookUrl: data.facebookUrl,
                instagramUrl: data.instagramUrl,
                tiktokUrl: data.tiktokUrl,
                twitterUrl: data.twitterUrl,
                youtubeUrl: data.youtubeUrl,
              }}
              socialBranchRef={data.socialBranchRef}
              branches={existingBranches}
              onSocialChange={(field, value) => updateField(field, value)}
              onSocialRefChange={(v) => updateField("socialBranchRef", v)}
            />
          )}
          {step === 4 && (
            <StepHours
              hours={{
                weekdays: data.hoursWeekdays,
                saturday: data.hoursSaturday,
                sunday: data.hoursSunday,
              }}
              hoursBranchRef={data.hoursBranchRef}
              branches={existingBranches}
              onHoursChange={(field, value) => {
                const fieldMap = {
                  weekdays: "hoursWeekdays" as const,
                  saturday: "hoursSaturday" as const,
                  sunday: "hoursSunday" as const,
                };
                updateField(fieldMap[field], value);
              }}
              onHoursRefChange={(v) => updateField("hoursBranchRef", v)}
            />
          )}

          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        </div>
      </div>

      <div className="border-t border-neutral-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (step === 0) handleOpenChange(false);
              else setStep((s) => s - 1);
            }}
          >
            {step === 0 ? "Cancelar" : "Anterior"}
          </Button>
          {isLastStep ? (
            <Button onClick={handleCreate} disabled={saving || !canGoNext()}>
              {saving ? "Creando..." : "Crear sucursal"}
            </Button>
          ) : (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canGoNext()}>
              Siguiente
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
