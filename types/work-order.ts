export type OrderStatus =
  | "RECIBIDO"
  | "EN_REVISION"
  | "ESPERANDO_REPUESTO"
  | "EN_REPARACION"
  | "LISTO_PARA_RETIRAR"
  | "ENTREGADO"
  | "SIN_REPARACION";

export type WarrantyStatus = "ACTIVE" | "EXPIRED" | "CLAIMED";

export type NoteType = "INTERNAL" | "TECHNICIAN";

export interface WorkOrder {
  id: string;
  orderCode: string;
  deviceModel: string;
  reportedFault: string;
  faultTags: string[];
  agreedPrice: number | null;
  partsCost: number | null;
  status: OrderStatus;
  warrantyDays: number | null;
  warrantyExpires: string | null;
  warrantyStatus: WarrantyStatus | null;
  internalNotes: string | null;
  technicianMessage: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  clientId: string;
  technicianId: string | null;
  createdById: string;
  storeId: string;
  client?: {
    id: string;
    name: string;
    phone: string | null;
  };
  technician?: {
    id: string;
    name: string;
  } | null;
  createdBy?: {
    id: string;
    name: string;
  };
  photos?: OrderPhoto[];
  statusLogs?: OrderStatusLog[];
  notes?: OrderNote[];
  rating?: OrderRating | null;
}

export interface OrderPhoto {
  id: string;
  url: string;
  caption: string | null;
  takenAt: string;
  orderId: string;
}

export interface OrderStatusLog {
  id: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  message: string | null;
  createdAt: string;
  orderId: string;
  changedById: string;
  changedBy?: {
    id: string;
    name: string;
  };
}

export interface OrderNote {
  id: string;
  content: string;
  type: NoteType;
  createdAt: string;
  orderId: string;
  authorId: string;
  author?: {
    id: string;
    name: string;
  };
}

export interface OrderRating {
  id: string;
  stars: number;
  feedback: string | null;
  createdAt: string;
  orderId: string;
}
