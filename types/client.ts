export type ClientTag = "NEW" | "RECURRING" | "FREQUENT" | "VIP";

export interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  tag: ClientTag;
  visitCount: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  storeId: string;
}
