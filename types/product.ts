export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  internalSku?: string;
  costPrice?: number;
  price: number;
  stock: number;
  active: boolean;
  imageUrl?: string;
  categoryId?: string;
  categoryName?: string;
  createdAt?: string;
}
