export interface ReceiptItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  status: "pendiente" | "pagado" | "anulado";
  paymentMethod: string;
  subtotal: number;
  commissionRate: number;
  commissionAmount: number;
  total: number;
  notes: string;
  items: ReceiptItem[];
  createdAt: Date;
}
