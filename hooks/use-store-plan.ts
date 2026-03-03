"use client";

import { useMemo } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import {
  type StorePlan,
  type StoreFeature,
  planHasFeature,
  getMinimumPlanForFeature,
  PLAN_FEATURES,
  isReadOnlyPlan,
} from "@/lib/store-plans";

export function useStorePlan() {
  const { storePlan, planExpiresAt } = useDashboard();

  const isReadOnly = useMemo(() => isReadOnlyPlan(storePlan), [storePlan]);

  const daysRemaining = useMemo(() => {
    if (storePlan !== "DEMO" || !planExpiresAt) return null;
    const expires = new Date(planExpiresAt);
    const now = new Date();
    const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [storePlan, planExpiresAt]);

  const hasFeature = useMemo(() => {
    return (feature: StoreFeature): boolean => {
      return planHasFeature(storePlan, feature);
    };
  }, [storePlan]);

  const getUpgradePlan = useMemo(() => {
    return (feature: StoreFeature): StorePlan | null => {
      if (hasFeature(feature)) return null;
      return getMinimumPlanForFeature(feature);
    };
  }, [hasFeature]);

  const availableFeatures = useMemo(() => {
    return PLAN_FEATURES[storePlan];
  }, [storePlan]);

  return {
    plan: storePlan,
    hasFeature,
    getUpgradePlan,
    availableFeatures,
    isReadOnly,
    daysRemaining,
  };
}
