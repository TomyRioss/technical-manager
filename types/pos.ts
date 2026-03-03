import type { Product } from "@/types/product";

export interface WorkOrderFormData {
  clientId: string;
  clientName: string;
  deviceModel: string;
  reportedFault: string;
  faultTags: string[];
  agreedPrice: number;
  partsCost: number;
  technicianId: string;
  internalNotes: string;
  warrantyDays: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  workOrder?: WorkOrderFormData;
}
