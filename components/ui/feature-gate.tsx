"use client";

import { useStorePlan } from "@/hooks/use-store-plan";
import type { StoreFeature } from "@/lib/store-plans";
import { Button } from "@/components/ui/button";
import { LuLock } from "react-icons/lu";

interface FeatureGateProps {
  feature: StoreFeature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { hasFeature, getUpgradePlan } = useStorePlan();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  const requiredPlan = getUpgradePlan(feature);

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200">
        <LuLock className="h-6 w-6 text-neutral-500" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-neutral-900">
        Funcionalidad Premium
      </h3>
      <p className="mt-2 max-w-sm text-sm text-neutral-600">
        Esta funcionalidad requiere el plan {requiredPlan}.
      </p>
      <Button className="mt-4" variant="default">
        Actualizar Plan
      </Button>
    </div>
  );
}
