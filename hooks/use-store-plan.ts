"use client";

import { useMemo } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import {
  type StorePlan,
  type StoreFeature,
  planHasFeature,
  getMinimumPlanForFeature,
  PLAN_FEATURES,
} from "@/lib/store-plans";

export function useStorePlan() {
  const { storePlan } = useDashboard();

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
  };
}
