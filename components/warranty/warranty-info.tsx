"use client";

import { WarrantyBadge } from "./warranty-badge";
import type { WarrantyStatus } from "@/types/work-order";
import { LuShieldCheck } from "react-icons/lu";

interface WarrantyInfoProps {
  warrantyDays: number | null;
  warrantyExpires: string | null;
  warrantyStatus: WarrantyStatus | null;
}

export function WarrantyInfo({ warrantyDays, warrantyExpires, warrantyStatus }: WarrantyInfoProps) {
  if (!warrantyDays && !warrantyStatus) {
    return null;
  }

  const daysRemaining = warrantyExpires
    ? Math.ceil((new Date(warrantyExpires).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 border border-border">
      <LuShieldCheck className="h-5 w-5 text-neutral-600 mt-0.5" />
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Garantía</span>
          {warrantyStatus && <WarrantyBadge status={warrantyStatus} />}
        </div>
        {warrantyDays && (
          <p className="text-sm text-neutral-600">{warrantyDays} días de garantía</p>
        )}
        {warrantyExpires && (
          <p className="text-sm text-neutral-600">
            Vence: {new Date(warrantyExpires).toLocaleDateString("es-AR")}
            {daysRemaining != null && daysRemaining > 0 && (
              <span className="text-neutral-500"> ({daysRemaining} días restantes)</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
