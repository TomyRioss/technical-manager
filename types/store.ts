export type StorePlan = "FREE" | "BASIC" | "PRO" | "ENTERPRISE";

export interface Store {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  plan: StorePlan;
  planExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}
