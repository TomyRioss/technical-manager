"use client";

import { cn } from "@/lib/utils";

interface PeriodComparisonProps {
  period: string;
  onPeriodChange: (period: string) => void;
}

const periods = [
  { key: "today", label: "Hoy" },
  { key: "week", label: "Esta semana" },
  { key: "month", label: "Este mes" },
];

export function PeriodComparison({ period, onPeriodChange }: PeriodComparisonProps) {
  return (
    <div className="flex gap-2">
      {periods.map((p) => (
        <button
          key={p.key}
          onClick={() => onPeriodChange(p.key)}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            period === p.key
              ? "bg-neutral-900 text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
