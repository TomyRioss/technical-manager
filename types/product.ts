export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  active: boolean;
  imageUrl?: string;
}
