"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HoursSelector } from "@/components/settings/hours-selector";
import { BranchRefPicker } from "@/components/settings/branch-ref-picker";
import { Branch } from "@/types/branch";
import { LuBuilding2, LuX } from "react-icons/lu";

interface HoursData {
  weekdays: string;
  saturday: string;
  sunday: string;
}

interface StepHoursProps {
  hours: HoursData;
  hoursBranchRef: string | null;
  branches: Branch[];
  onHoursChange: (field: keyof HoursData, value: string) => void;
  onHoursRefChange: (branchId: string | null) => void;
}

function parseBranchHours(branch: Branch): string {
  if (!branch.businessHours) return "Sin horarios";
  try {
    const parsed = JSON.parse(branch.businessHours);
    return `L-V: ${parsed.weekdays || "—"}, Sáb: ${parsed.saturday || "—"}`;
  } catch {
    return "Sin horarios";
  }
}

export function StepHours({
  hours,
  hoursBranchRef,
  branches,
  onHoursChange,
  onHoursRefChange,
}: StepHoursProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const refBranch = hoursBranchRef
    ? branches.find((b) => b.id === hoursBranchRef)
    : null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-800">Horarios</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Configurá los horarios de atención de esta sucursal.
        </p>
      </div>

      {refBranch ? (
        <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <LuBuilding2 className="h-4 w-4 text-neutral-500 shrink-0" />
          <span className="text-sm text-neutral-700 flex-1">
            Usando horarios de <strong>{refBranch.name}</strong>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onHoursRefChange(null)}
          >
            <LuX className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div className="space-y-1">
          <HoursSelector
            label="Lunes a Viernes"
            value={hours.weekdays}
            onChange={(v) => onHoursChange("weekdays", v)}
          />
          <HoursSelector
            label="Sábado"
            value={hours.saturday}
            onChange={(v) => onHoursChange("saturday", v)}
          />
          <HoursSelector
            label="Domingo"
            value={hours.sunday}
            onChange={(v) => onHoursChange("sunday", v)}
          />
        </div>
      )}

      {branches.filter((b) => !b.hoursBranchRef).length > 0 && !refBranch && (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-700 transition-colors"
        >
          Copiar horarios de otra sucursal
        </button>
      )}

      <BranchRefPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        branches={branches.filter((b) => !b.hoursBranchRef)}
        selectedBranchId={hoursBranchRef}
        onSelect={(branch) => onHoursRefChange(branch.id)}
        title="Seleccionar sucursal"
        description="Los horarios de la sucursal seleccionada se usarán para esta."
        renderDetail={(b) => parseBranchHours(b)}
      />
    </div>
  );
}
