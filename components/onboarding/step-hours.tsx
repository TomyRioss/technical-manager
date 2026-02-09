"use client";

import { HoursSelector } from "@/components/settings/hours-selector";

interface StepHoursProps {
  weekdays: string;
  saturday: string;
  sunday: string;
  onWeekdaysChange: (value: string) => void;
  onSaturdayChange: (value: string) => void;
  onSundayChange: (value: string) => void;
}

export function StepHours({
  weekdays,
  saturday,
  sunday,
  onWeekdaysChange,
  onSaturdayChange,
  onSundayChange,
}: StepHoursProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-800">Horarios de atención</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Esta información se verá junto al mapa en tu catálogo.
        </p>
      </div>
      <div className="space-y-2">
        <HoursSelector label="Lunes a Viernes" value={weekdays} onChange={onWeekdaysChange} />
        <HoursSelector label="Sábado" value={saturday} onChange={onSaturdayChange} />
        <HoursSelector label="Domingo" value={sunday} onChange={onSundayChange} />
      </div>
    </div>
  );
}
