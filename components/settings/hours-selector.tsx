"use client";

import { Checkbox } from "@/components/ui/checkbox";

interface HoursSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function parseValue(value: string): { open: string; close: string; closed: boolean } {
  if (!value || value === "Cerrado") {
    return { open: "09:00", close: "18:00", closed: true };
  }
  const match = value.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
  if (match) {
    return { open: match[1], close: match[2], closed: false };
  }
  return { open: "09:00", close: "18:00", closed: true };
}

export function HoursSelector({ label, value, onChange }: HoursSelectorProps) {
  const { open, close, closed } = parseValue(value);

  return (
    <div className="flex items-center gap-4 py-2">
      <span className="text-sm font-medium text-neutral-700 w-28 shrink-0">{label}</span>

      <div className="flex items-center gap-2">
        <Checkbox
          id={`closed-${label}`}
          checked={closed}
          onCheckedChange={(checked) => {
            if (checked) {
              onChange("Cerrado");
            } else {
              onChange(`${open}-${close}`);
            }
          }}
        />
        <label htmlFor={`closed-${label}`} className="text-sm text-neutral-600 cursor-pointer">
          Cerrado
        </label>
      </div>

      {!closed && (
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={open}
            onChange={(e) => onChange(`${e.target.value}-${close}`)}
            className="border border-neutral-200 rounded-md px-2 py-1 text-sm"
          />
          <span className="text-neutral-400 text-sm">a</span>
          <input
            type="time"
            value={close}
            onChange={(e) => onChange(`${open}-${e.target.value}`)}
            className="border border-neutral-200 rounded-md px-2 py-1 text-sm"
          />
        </div>
      )}
    </div>
  );
}
