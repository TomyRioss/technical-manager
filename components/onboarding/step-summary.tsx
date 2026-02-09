"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LuCheck, LuMinus } from "react-icons/lu";

interface OnboardingData {
  whatsappNumber: string;
  googleMapsUrl: string;
  storeAddress: string;
  hoursWeekdays: string;
  hoursSaturday: string;
  hoursSunday: string;
  logoUrl: string | null;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
}

interface StepSummaryProps {
  data: OnboardingData;
  onChange: (field: keyof OnboardingData, value: string) => void;
}

function StatusIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <LuCheck className="h-4 w-4 text-green-600" />
  ) : (
    <LuMinus className="h-4 w-4 text-neutral-400" />
  );
}

export function StepSummary({ data, onChange }: StepSummaryProps) {
  const items = [
    { label: "WhatsApp", value: data.whatsappNumber },
    { label: "Google Maps", value: data.googleMapsUrl },
    { label: "Dirección", value: data.storeAddress },
    { label: "Horarios", value: data.hoursWeekdays || data.hoursSaturday || data.hoursSunday },
    { label: "Logo", value: data.logoUrl },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-800">Resumen</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Revisá lo que configuraste. Podés agregar tus redes sociales antes de empezar.
        </p>
      </div>

      <div className="space-y-1 rounded-md border border-neutral-200 bg-white p-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 py-1">
            <StatusIcon filled={!!item.value} />
            <span className="text-sm text-neutral-700">{item.label}</span>
            {item.value && (
              <span className="text-xs text-neutral-500 truncate ml-auto max-w-[200px]">
                {typeof item.value === "string" && item.value.length > 40
                  ? item.value.slice(0, 40) + "..."
                  : item.value}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-semibold text-neutral-800">Redes Sociales</h3>
        <p className="text-xs text-neutral-500">
          Aparecerán en el footer de tu tienda pública.
        </p>
        <div className="space-y-2">
          <Label htmlFor="ob-facebook">Facebook</Label>
          <Input
            id="ob-facebook"
            placeholder="https://facebook.com/tu-pagina"
            value={data.facebookUrl}
            onChange={(e) => onChange("facebookUrl", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ob-instagram">Instagram</Label>
          <Input
            id="ob-instagram"
            placeholder="https://instagram.com/tu-cuenta"
            value={data.instagramUrl}
            onChange={(e) => onChange("instagramUrl", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ob-tiktok">TikTok</Label>
          <Input
            id="ob-tiktok"
            placeholder="https://tiktok.com/@tu-cuenta"
            value={data.tiktokUrl}
            onChange={(e) => onChange("tiktokUrl", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ob-twitter">Twitter / X</Label>
          <Input
            id="ob-twitter"
            placeholder="https://x.com/tu-cuenta"
            value={data.twitterUrl}
            onChange={(e) => onChange("twitterUrl", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ob-youtube">YouTube</Label>
          <Input
            id="ob-youtube"
            placeholder="https://youtube.com/@tu-canal"
            value={data.youtubeUrl}
            onChange={(e) => onChange("youtubeUrl", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
