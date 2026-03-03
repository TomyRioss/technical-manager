"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BranchRefPicker } from "@/components/settings/branch-ref-picker";
import { Branch } from "@/types/branch";
import { LuBuilding2, LuX } from "react-icons/lu";

interface StepPhoneProps {
  whatsappNumber: string;
  phoneBranchRef: string | null;
  branches: Branch[];
  onWhatsappChange: (value: string) => void;
  onPhoneRefChange: (branchId: string | null) => void;
}

export function StepPhone({
  whatsappNumber,
  phoneBranchRef,
  branches,
  onWhatsappChange,
  onPhoneRefChange,
}: StepPhoneProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const refBranch = phoneBranchRef
    ? branches.find((b) => b.id === phoneBranchRef)
    : null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-800">Teléfono</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Número de WhatsApp para que los clientes contacten a esta sucursal.
        </p>
      </div>

      {refBranch ? (
        <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <LuBuilding2 className="h-4 w-4 text-neutral-500 shrink-0" />
          <span className="text-sm text-neutral-700 flex-1">
            Usando teléfono de <strong>{refBranch.name}</strong>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onPhoneRefChange(null)}
          >
            <LuX className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="branch-whatsapp">Número de WhatsApp</Label>
          <Input
            id="branch-whatsapp"
            placeholder="Ej: +54 11 1234-5678"
            value={whatsappNumber}
            onChange={(e) => onWhatsappChange(e.target.value)}
          />
        </div>
      )}

      {branches.filter((b) => !b.phoneBranchRef).length > 0 && !refBranch && (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-700 transition-colors"
        >
          Usar teléfono de otra sucursal
        </button>
      )}

      <BranchRefPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        branches={branches.filter((b) => !b.phoneBranchRef)}
        selectedBranchId={phoneBranchRef}
        onSelect={(branch) => onPhoneRefChange(branch.id)}
        title="Seleccionar sucursal"
        description="El teléfono de la sucursal seleccionada se usará para esta."
        renderDetail={(b) => b.whatsappNumber || b.phone || "Sin teléfono"}
      />
    </div>
  );
}
