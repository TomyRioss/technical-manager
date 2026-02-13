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
import type { WorkOrder } from "@/types/work-order";
import type { UserRole } from "@/lib/auth-check";
import { type StorePlan, isReadOnlyPlan } from "@/lib/store-plans";

interface CommissionConfig {
  paymentMethod: string;
  commissionRate: number;
}

interface DashboardContextType {
  storeId: string;
  storeName: string;
  storeSlug: string;
  storePlan: StorePlan;
  planExpiresAt: string | null;
  userId: string;
  userRole: UserRole;

  products: Product[];
  addProduct: (product: Omit<Product, "id">) => Promise<string | null>;
  updateProduct: (id: string, product: Omit<Product, "id">) => Promise<void>;
  updateProductCategory: (id: string, categoryId: string | null) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  setProductImage: (id: string, imageUrl: string) => void;

  receipts: Receipt[];
  archivedReceipts: Receipt[];
  addReceipt: (receipt: Omit<Receipt, "id" | "receiptNumber" | "createdAt">) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
  archiveReceipt: (id: string) => Promise<void>;
  getReceipt: (id: string) => Receipt | undefined;

  workOrders: WorkOrder[];

  commissions: CommissionConfig[];
  updateCommissions: (commissions: CommissionConfig[]) => Promise<void>;
  getCommissionRate: (paymentMethod: string) => number;

  loading: boolean;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

interface DashboardProviderProps {
  children: ReactNode;
  storeId: string;
  storeName: string;
  storeSlug: string;
  storePlan: StorePlan;
  planExpiresAt: string | null;
  userId: string;
  userRole: UserRole;
}

export function DashboardProvider({ children, storeId, storeName, storeSlug, storePlan, planExpiresAt, userId, userRole }: DashboardProviderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [archivedReceipts, setArchivedReceipts] = useState<Receipt[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [commissions, setCommissions] = useState<CommissionConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch initial data ---

  const fetchProducts = useCallback(async () => {
    const res = await fetch(`/api/items?storeId=${storeId}`);
    if (!res.ok) return;
    const items = await res.json();
    setProducts(
      items.map((i: Record<string, unknown>) => {
        const cat = i.category as { id: string; name: string } | null;
        return {
          id: i.id as string,
          name: i.name as string,
          sku: i.sku as string,
          costPrice: (i.costPrice as number) || undefined,
          price: i.salePrice as number,
          stock: i.stock as number,
          active: i.isActive as boolean,
          imageUrl: (i.imageUrl as string) || undefined,
          categoryId: cat?.id || undefined,
          categoryName: cat?.name || undefined,
        };
      })
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

  const fetchArchivedReceipts = useCallback(async () => {
    const res = await fetch(`/api/receipts?storeId=${storeId}&archived=true`);
    if (!res.ok) return;
    const data = await res.json();
    setArchivedReceipts(
      data.map((r: Record<string, unknown>) => ({
        ...r,
        createdAt: new Date(r.createdAt as string),
      }))
    );
  }, [storeId]);

  const fetchWorkOrders = useCallback(async () => {
    const res = await fetch(`/api/work-orders?storeId=${storeId}`);
    if (!res.ok) return;
    const data = await res.json();
    setWorkOrders(data);
  }, [storeId]);

  const fetchCommissions = useCallback(async () => {
    const res = await fetch(`/api/commissions?storeId=${storeId}`);
    if (!res.ok) return;
    const data = await res.json();
    setCommissions(data);
  }, [storeId]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchReceipts(), fetchArchivedReceipts(), fetchWorkOrders(), fetchCommissions()]);
      setLoading(false);
    }
    load();
  }, [fetchProducts, fetchReceipts, fetchArchivedReceipts, fetchWorkOrders, fetchCommissions]);

  // --- Products ---

  async function addProduct(data: Omit<Product, "id">): Promise<string | null> {
    if (isReadOnlyPlan(storePlan)) return null;
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        sku: data.sku,
        costPrice: data.costPrice || null,
        salePrice: data.price,
        stock: data.stock,
        isActive: data.active,
        storeId,
        categoryId: data.categoryId || null,
      }),
    });
    if (!res.ok) return null;
    const item = await res.json();
    const cat = item.category as { id: string; name: string } | null;
    setProducts((prev) => [
      {
        id: item.id,
        name: item.name,
        sku: item.sku,
        costPrice: item.costPrice || undefined,
        price: item.salePrice,
        stock: item.stock,
        active: item.isActive,
        imageUrl: data.imageUrl,
        categoryId: cat?.id || undefined,
        categoryName: cat?.name || undefined,
      },
      ...prev,
    ]);
    return item.id;
  }

  async function updateProduct(id: string, data: Omit<Product, "id">) {
    if (isReadOnlyPlan(storePlan)) return;
    const res = await fetch(`/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        sku: data.sku,
        costPrice: data.costPrice || null,
        salePrice: data.price,
        stock: data.stock,
        isActive: data.active,
        categoryId: data.categoryId || null,
      }),
    });
    if (!res.ok) return;
    const item = await res.json();
    const cat = item.category as { id: string; name: string } | null;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              id: item.id,
              name: item.name,
              sku: item.sku,
              costPrice: item.costPrice || undefined,
              price: item.salePrice,
              stock: item.stock,
              active: item.isActive,
              imageUrl: data.imageUrl ?? p.imageUrl,
              categoryId: cat?.id || undefined,
              categoryName: cat?.name || undefined,
            }
          : p
      )
    );
  }

  async function deleteProduct(id: string) {
    if (isReadOnlyPlan(storePlan)) return;
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

  async function updateProductCategory(id: string, categoryId: string | null) {
    if (isReadOnlyPlan(storePlan)) return;
    const res = await fetch(`/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId }),
    });
    if (!res.ok) return;
    const item = await res.json();
    const cat = item.category as { id: string; name: string } | null;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, categoryId: cat?.id, categoryName: cat?.name } : p
      )
    );
  }

  // --- Commissions ---

  const paymentMethodToEnum: Record<string, string> = {
    "Efectivo": "CASH",
    "Transferencia Debito": "DEBIT_TRANSFER",
    "Transferencia Credito": "CREDIT_TRANSFER",
    "Otro": "OTHER",
  };

  async function updateCommissions(updated: CommissionConfig[]) {
    if (isReadOnlyPlan(storePlan)) return;
    const res = await fetch("/api/commissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId, commissions: updated }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setCommissions(data);
  }

  function getCommissionRate(paymentMethod: string): number {
    const enumVal = paymentMethodToEnum[paymentMethod] || paymentMethod;
    const found = commissions.find((c) => c.paymentMethod === enumVal);
    return found?.commissionRate ?? 0;
  }

  // --- Receipts ---

  async function addReceipt(data: Omit<Receipt, "id" | "receiptNumber" | "createdAt">) {
    if (isReadOnlyPlan(storePlan)) return;
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
    if (isReadOnlyPlan(storePlan)) return;
    const receipt = receipts.find((r) => r.id === id) || archivedReceipts.find((r) => r.id === id);
    const res = await fetch(`/api/receipts/${id}`, { method: "DELETE" });
    if (!res.ok) return;

    // Remove from whichever list it belongs to
    setReceipts((prev) => prev.filter((r) => r.id !== id));
    setArchivedReceipts((prev) => prev.filter((r) => r.id !== id));

    // Restore local stock
    if (receipt) {
      setProducts((prev) =>
        prev.map((p) => {
          const restored = receipt.items
            .filter((i) => i.productId === p.id)
            .reduce((sum, i) => sum + i.quantity, 0);
          if (restored === 0) return p;
          return { ...p, stock: p.stock + restored };
        })
      );
    }
  }

  async function archiveReceipt(id: string) {
    if (isReadOnlyPlan(storePlan)) return;
    const res = await fetch(`/api/receipts/${id}`, { method: "PATCH" });
    if (!res.ok) return;
    const receipt = receipts.find((r) => r.id === id);
    setReceipts((prev) => prev.filter((r) => r.id !== id));
    if (receipt) {
      setArchivedReceipts((prev) => [receipt, ...prev]);
    }
  }

  function getReceipt(id: string) {
    return receipts.find((r) => r.id === id) || archivedReceipts.find((r) => r.id === id);
  }

  return (
    <DashboardContext.Provider
      value={{
        storeId,
        storeName,
        storeSlug,
        storePlan,
        planExpiresAt,
        userId,
        userRole,
        products,
        addProduct,
        updateProduct,
        updateProductCategory,
        deleteProduct,
        getProduct,
        setProductImage,
        receipts,
        archivedReceipts,
        addReceipt,
        deleteReceipt,
        archiveReceipt,
        getReceipt,
        workOrders,
        commissions,
        updateCommissions,
        getCommissionRate,
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
