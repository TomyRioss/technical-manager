"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Product } from "@/types/product";
import type { Receipt } from "@/types/receipt";

interface DashboardContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => Promise<string | null>;
  updateProduct: (id: string, product: Omit<Product, "id">) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  setProductImage: (id: string, imageUrl: string) => void;

  receipts: Receipt[];
  addReceipt: (receipt: Omit<Receipt, "id" | "receiptNumber" | "createdAt">) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
  getReceipt: (id: string) => Receipt | undefined;

  loading: boolean;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

interface DashboardProviderProps {
  children: ReactNode;
  storeId: string;
  userId: string;
}

export function DashboardProvider({ children, storeId, userId }: DashboardProviderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch initial data ---

  const fetchProducts = useCallback(async () => {
    const res = await fetch(`/api/items?storeId=${storeId}`);
    if (!res.ok) return;
    const items = await res.json();
    setProducts(
      items.map((i: Record<string, unknown>) => ({
        id: i.id,
        name: i.name,
        sku: i.sku,
        price: i.salePrice,
        stock: i.stock,
        active: i.isActive,
      }))
    );
  }, [storeId]);

  const fetchReceipts = useCallback(async () => {
    const res = await fetch(`/api/receipts?storeId=${storeId}`);
    if (!res.ok) return;
    const data = await res.json();
    setReceipts(
      data.map((r: Record<string, unknown>) => ({
        ...r,
        createdAt: new Date(r.createdAt as string),
      }))
    );
  }, [storeId]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchReceipts()]);
      setLoading(false);
    }
    load();
  }, [fetchProducts, fetchReceipts]);

  // --- Products ---

  async function addProduct(data: Omit<Product, "id">): Promise<string | null> {
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        sku: data.sku,
        salePrice: data.price,
        stock: data.stock,
        isActive: data.active,
        storeId,
      }),
    });
    if (!res.ok) return null;
    const item = await res.json();
    setProducts((prev) => [
      {
        id: item.id,
        name: item.name,
        sku: item.sku,
        price: item.salePrice,
        stock: item.stock,
        active: item.isActive,
        imageUrl: data.imageUrl,
      },
      ...prev,
    ]);
    return item.id;
  }

  async function updateProduct(id: string, data: Omit<Product, "id">) {
    const res = await fetch(`/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        sku: data.sku,
        salePrice: data.price,
        stock: data.stock,
        isActive: data.active,
      }),
    });
    if (!res.ok) return;
    const item = await res.json();
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              id: item.id,
              name: item.name,
              sku: item.sku,
              price: item.salePrice,
              stock: item.stock,
              active: item.isActive,
              imageUrl: data.imageUrl ?? p.imageUrl,
            }
          : p
      )
    );
  }

  async function deleteProduct(id: string) {
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function getProduct(id: string) {
    return products.find((p) => p.id === id);
  }

  function setProductImage(id: string, imageUrl: string) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, imageUrl } : p))
    );
  }

  // --- Receipts ---

  async function addReceipt(data: Omit<Receipt, "id" | "receiptNumber" | "createdAt">) {
    const res = await fetch("/api/receipts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        userId,
        paymentMethod: data.paymentMethod,
        subtotal: data.subtotal,
        commissionRate: data.commissionRate,
        commissionAmount: data.commissionAmount,
        total: data.total,
        notes: data.notes,
        items: data.items,
      }),
    });
    if (!res.ok) return;
    const receipt = await res.json();
    setReceipts((prev) => [
      { ...receipt, createdAt: new Date(receipt.createdAt) },
      ...prev,
    ]);

    // Update local stock
    setProducts((prev) =>
      prev.map((p) => {
        const sold = data.items
          .filter((i) => i.productId === p.id)
          .reduce((sum, i) => sum + i.quantity, 0);
        if (sold === 0) return p;
        return { ...p, stock: Math.max(0, p.stock - sold) };
      })
    );
  }

  async function deleteReceipt(id: string) {
    const res = await fetch(`/api/receipts/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setReceipts((prev) => prev.filter((r) => r.id !== id));
  }

  function getReceipt(id: string) {
    return receipts.find((r) => r.id === id);
  }

  return (
    <DashboardContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
        setProductImage,
        receipts,
        addReceipt,
        deleteReceipt,
        getReceipt,
        loading,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
