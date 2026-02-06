export const STORE_PLANS = {
  FREE: "FREE",
  BASIC: "BASIC",
  PRO: "PRO",
  ENTERPRISE: "ENTERPRISE",
} as const;

export type StorePlan = keyof typeof STORE_PLANS;

export const STORE_FEATURES = {
  INVENTORY: "INVENTORY",
  WORK_ORDERS: "WORK_ORDERS",
  CLIENTS: "CLIENTS",
  RECEIPTS: "RECEIPTS",
  ECOMMERCE: "ECOMMERCE",
  CUSTOM_BRANDING: "CUSTOM_BRANDING",
  EXPORT_DATA: "EXPORT_DATA",
  CHATBOT: "CHATBOT",
  WHATSAPP_NOTIFICATIONS: "WHATSAPP_NOTIFICATIONS",
  ADVANCED_ANALYTICS: "ADVANCED_ANALYTICS",
  INTEGRATIONS: "INTEGRATIONS",
  API_ACCESS: "API_ACCESS",
  MULTI_LOCATION: "MULTI_LOCATION",
  CUSTOM_AUTOMATIONS: "CUSTOM_AUTOMATIONS",
  PRIORITY_SUPPORT: "PRIORITY_SUPPORT",
} as const;

export type StoreFeature = keyof typeof STORE_FEATURES;

export const PLAN_FEATURES: Record<StorePlan, StoreFeature[]> = {
  FREE: [
    "INVENTORY",
    "WORK_ORDERS",
    "CLIENTS",
    "RECEIPTS",
  ],
  BASIC: [
    "INVENTORY",
    "WORK_ORDERS",
    "CLIENTS",
    "RECEIPTS",
    "ECOMMERCE",
    "CUSTOM_BRANDING",
    "EXPORT_DATA",
  ],
  PRO: [
    "INVENTORY",
    "WORK_ORDERS",
    "CLIENTS",
    "RECEIPTS",
    "ECOMMERCE",
    "CUSTOM_BRANDING",
    "EXPORT_DATA",
    "CHATBOT",
    "WHATSAPP_NOTIFICATIONS",
    "ADVANCED_ANALYTICS",
    "INTEGRATIONS",
  ],
  ENTERPRISE: [
    "INVENTORY",
    "WORK_ORDERS",
    "CLIENTS",
    "RECEIPTS",
    "ECOMMERCE",
    "CUSTOM_BRANDING",
    "EXPORT_DATA",
    "CHATBOT",
    "WHATSAPP_NOTIFICATIONS",
    "ADVANCED_ANALYTICS",
    "INTEGRATIONS",
    "API_ACCESS",
    "MULTI_LOCATION",
    "CUSTOM_AUTOMATIONS",
    "PRIORITY_SUPPORT",
  ],
};

export function planHasFeature(plan: StorePlan, feature: StoreFeature): boolean {
  return PLAN_FEATURES[plan].includes(feature);
}

export function getMinimumPlanForFeature(feature: StoreFeature): StorePlan {
  const plans: StorePlan[] = ["FREE", "BASIC", "PRO", "ENTERPRISE"];
  for (const plan of plans) {
    if (PLAN_FEATURES[plan].includes(feature)) {
      return plan;
    }
  }
  return "ENTERPRISE";
}
