"use client";

import Link from "next/link";
import { useStorePlan } from "@/hooks/use-store-plan";
import { LuClock, LuLock } from "react-icons/lu";

export function TrialBanner() {
  const { plan, isReadOnly, daysRemaining } = useStorePlan();

  if (plan === "DEMO") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-blue-800">
          <LuClock className="h-4 w-4 shrink-0" />
          <span>
            Te quedan <strong>{daysRemaining ?? 0} día{daysRemaining !== 1 ? "s" : ""}</strong> de prueba gratuita
          </span>
        </div>
        <Link
          href="/dashboard/configuracion/plan"
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors text-center w-full sm:w-auto"
        >
          Actualizar plan
        </Link>
      </div>
    );
  }

  if (isReadOnly) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-amber-800">
          <LuLock className="h-4 w-4 shrink-0" />
          <span>
            Tu período de prueba finalizó. El dashboard es de <strong>solo lectura</strong>.
          </span>
        </div>
        <Link
          href="/contacto"
          className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 transition-colors text-center w-full sm:w-auto"
        >
          Actualizar plan
        </Link>
      </div>
    );
  }

  return null;
}
