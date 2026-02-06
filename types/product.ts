export interface Product {
  id: string;
  name: string;
  sku: string;
  costPrice?: number;
  price: number;
  stock: number;
  active: boolean;
  imageUrl?: string;
  categoryId?: string;
  categoryName?: string;
}
