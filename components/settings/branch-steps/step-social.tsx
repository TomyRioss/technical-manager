"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BranchRefPicker } from "@/components/settings/branch-ref-picker";
import { Branch } from "@/types/branch";
import { LuBuilding2, LuX } from "react-icons/lu";

interface SocialData {
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
}

interface StepSocialProps {
  social: SocialData;
  socialBranchRef: string | null;
  branches: Branch[];
  onSocialChange: (field: keyof SocialData, value: string) => void;
  onSocialRefChange: (branchId: string | null) => void;
}

export function StepSocial({
  social,
  socialBranchRef,
  branches,
  onSocialChange,
  onSocialRefChange,
}: StepSocialProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const refBranch = socialBranchRef
    ? branches.find((b) => b.id === socialBranchRef)
    : null;

  function countSocials(b: Branch): number {
    return [b.facebookUrl, b.instagramUrl, b.tiktokUrl, b.twitterUrl, b.youtubeUrl]
      .filter(Boolean).length;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-800">Redes sociales</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Aparecerán en el catálogo público de esta sucursal.
        </p>
      </div>

      {refBranch ? (
        <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <LuBuilding2 className="h-4 w-4 text-neutral-500 shrink-0" />
          <span className="text-sm text-neutral-700 flex-1">
            Usando redes de <strong>{refBranch.name}</strong>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onSocialRefChange(null)}
          >
            <LuX className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="branch-facebook">Facebook</Label>
            <Input
              id="branch-facebook"
              placeholder="https://facebook.com/tu-pagina"
              value={social.facebookUrl}
              onChange={(e) => onSocialChange("facebookUrl", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch-instagram">Instagram</Label>
            <Input
              id="branch-instagram"
              placeholder="https://instagram.com/tu-cuenta"
              value={social.instagramUrl}
              onChange={(e) => onSocialChange("instagramUrl", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch-tiktok">TikTok</Label>
            <Input
              id="branch-tiktok"
              placeholder="https://tiktok.com/@tu-cuenta"
              value={social.tiktokUrl}
              onChange={(e) => onSocialChange("tiktokUrl", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch-twitter">Twitter / X</Label>
            <Input
              id="branch-twitter"
              placeholder="https://x.com/tu-cuenta"
              value={social.twitterUrl}
              onChange={(e) => onSocialChange("twitterUrl", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch-youtube">YouTube</Label>
            <Input
              id="branch-youtube"
              placeholder="https://youtube.com/@tu-canal"
              value={social.youtubeUrl}
              onChange={(e) => onSocialChange("youtubeUrl", e.target.value)}
            />
          </div>
        </div>
      )}

      {branches.filter((b) => !b.socialBranchRef).length > 0 && !refBranch && (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-700 transition-colors"
        >
          Copiar redes de otra sucursal
        </button>
      )}

      <BranchRefPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        branches={branches.filter((b) => !b.socialBranchRef)}
        selectedBranchId={socialBranchRef}
        onSelect={(branch) => onSocialRefChange(branch.id)}
        title="Seleccionar sucursal"
        description="Las redes sociales de la sucursal seleccionada se usarán para esta."
        renderDetail={(b) => {
          const count = countSocials(b);
          return count > 0 ? `${count} red${count > 1 ? "es" : ""} configurada${count > 1 ? "s" : ""}` : "Sin redes";
        }}
      />
    </div>
  );
}
