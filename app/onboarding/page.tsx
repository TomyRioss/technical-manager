"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { StepWhatsapp } from "@/components/onboarding/step-whatsapp";
import { StepLocation } from "@/components/onboarding/step-location";
import { StepHours } from "@/components/onboarding/step-hours";
import { StepMembers } from "@/components/onboarding/step-members";
import { StepLogo } from "@/components/onboarding/step-logo";
import { StepSummary } from "@/components/onboarding/step-summary";

const STEPS = ["WhatsApp", "Ubicación", "Horarios", "Equipo", "Logo", "Resumen"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("");

  const [data, setData] = useState({
    whatsappNumber: "",
    googleMapsUrl: "",
    storeAddress: "",
    hoursWeekdays: "",
    hoursSaturday: "",
    hoursSunday: "",
    logoUrl: null as string | null,
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setStoreId(user.storeId);
      setStoreName(user.storeName || "");
    } else {
      router.push("/login");
    }
  }, [router]);

  function updateField<K extends keyof typeof data>(field: K, value: (typeof data)[K]) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  const canAdvance = step === 0 ? data.whatsappNumber.trim().length > 0 : true;
  const isLastStep = step === STEPS.length - 1;

  async function handleFinish() {
    setSaving(true);
    const slug = storeName.trim().toLowerCase().replace(/\s+/g, "-") || storeId;
    const businessHours = JSON.stringify({
      weekdays: data.hoursWeekdays.trim() || null,
      saturday: data.hoursSaturday.trim() || null,
      sunday: data.hoursSunday.trim() || null,
    });

    await fetch("/api/store-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        slug,
        whatsappNumber: data.whatsappNumber.trim() || null,
        googleMapsUrl: data.googleMapsUrl.trim() || null,
        storeAddress: data.storeAddress.trim() || null,
        businessHours,
        logoUrl: data.logoUrl,
        facebookUrl: data.facebookUrl.trim() || null,
        instagramUrl: data.instagramUrl.trim() || null,
        tiktokUrl: data.tiktokUrl.trim() || null,
        twitterUrl: data.twitterUrl.trim() || null,
        youtubeUrl: data.youtubeUrl.trim() || null,
      }),
    });
    router.push("/dashboard");
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  if (!storeId) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-lg space-y-6">

        {/* Progress */}
        <div className="space-y-3">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between">
            {STEPS.map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
                    i < step
                      ? "bg-neutral-900 text-white"
                      : i === step
                        ? "border-2 border-neutral-900 text-neutral-900"
                        : "border border-neutral-300 text-neutral-400"
                  )}
                >
                  {i + 1}
                </div>
                <span
                  className={cn(
                    "text-[10px] hidden sm:block",
                    i === step ? "text-neutral-800 font-medium" : "text-neutral-400"
                  )}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          {step === 0 && (
            <StepWhatsapp
              value={data.whatsappNumber}
              onChange={(v) => updateField("whatsappNumber", v)}
            />
          )}
          {step === 1 && (
            <StepLocation
              googleMapsUrl={data.googleMapsUrl}
              storeAddress={data.storeAddress}
              onGoogleMapsUrlChange={(v) => updateField("googleMapsUrl", v)}
              onStoreAddressChange={(v) => updateField("storeAddress", v)}
            />
          )}
          {step === 2 && (
            <StepHours
              weekdays={data.hoursWeekdays}
              saturday={data.hoursSaturday}
              sunday={data.hoursSunday}
              onWeekdaysChange={(v) => updateField("hoursWeekdays", v)}
              onSaturdayChange={(v) => updateField("hoursSaturday", v)}
              onSundayChange={(v) => updateField("hoursSunday", v)}
            />
          )}
          {step === 3 && <StepMembers storeId={storeId} />}
          {step === 4 && (
            <StepLogo
              storeId={storeId}
              logoUrl={data.logoUrl}
              onLogoChange={(v) => updateField("logoUrl", v)}
            />
          )}
          {step === 5 && (
            <StepSummary
              data={data}
              onChange={(field, value) => updateField(field, value)}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <div>
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Anterior
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {!isLastStep && step > 0 && (
              <Button variant="ghost" onClick={() => setStep(step + 1)}>
                Omitir
              </Button>
            )}
            {isLastStep ? (
              <Button onClick={handleFinish} disabled={saving}>
                {saving ? "Guardando..." : "Empezar a usar Koldesk"}
              </Button>
            ) : (
              <Button onClick={() => setStep(step + 1)} disabled={!canAdvance}>
                Siguiente
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
