"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import useSWR, { useSWRConfig } from "swr";
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
  branchId: string;
  branchName: string;
  branchSlug: string;

  products: Product[];
  addProduct: (product: Omit<Product, "id">) => Promise<string | null>;
  updateProduct: (id: string, product: Omit<Product, "id">) => Promise<void>;
  updateProductCategory: (id: string, categoryId: string | null) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductActive: (id: string, forceActive?: boolean) => Promise<void>;
  bulkSetActive: (ids: string[], isActive: boolean) => void;
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
  refetchBranches: () => void;
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
  branchId: string;
  branchName: string;
  branchSlug: string;
  refetchBranches: () => void;
}

function mapItemToProduct(i: Record<string, unknown>): Product {
  const cat = i.category as { id: string; name: string } | null;
  return {
    id: i.id as string,
    name: i.name as string,
    sku: i.sku as string,
    costPrice: (i.costPrice as number) || undefined,
    price: i.salePrice as number,
    stock: i.stock as number,
    active: i.isActive as boolean,
    description: (i.description as string) || undefined,
    imageUrl: (i.imageUrl as string) || undefined,
    categoryId: cat?.id || undefined,
    categoryName: cat?.name || undefined,
  };
}

function mapReceipt(r: Record<string, unknown>): Receipt {
  return {
    ...r,
    createdAt: new Date(r.createdAt as string),
  } as Receipt;
}

export function DashboardProvider({ children, storeId, storeName, storeSlug, storePlan, planExpiresAt, userId, userRole, branchId, branchName, branchSlug, refetchBranches }: DashboardProviderProps) {
  const { mutate } = useSWRConfig();

  const productsKey = `/api/items?storeId=${storeId}&branchId=${branchId}`;
  const receiptsKey = `/api/receipts?storeId=${storeId}&branchId=${branchId}`;
  const archivedReceiptsKey = `/api/receipts?storeId=${storeId}&branchId=${branchId}&archived=true`;
  const workOrdersKey = `/api/work-orders?storeId=${storeId}&branchId=${branchId}`;
  const commissionsKey = `/api/commissions?storeId=${storeId}`;

  const { data: rawProducts, isLoading: loadingProducts } = useSWR<Record<string, unknown>[]>(productsKey);
  const { data: rawReceipts, isLoading: loadingReceipts } = useSWR<Record<string, unknown>[]>(receiptsKey);
  const { data: rawArchivedReceipts, isLoading: loadingArchived } = useSWR<Record<string, unknown>[]>(archivedReceiptsKey);
  const { data: rawWorkOrders, isLoading: loadingOrders } = useSWR<WorkOrder[]>(workOrdersKey);
  const { data: rawCommissions, isLoading: loadingCommissions } = useSWR<CommissionConfig[]>(commissionsKey);

  const products = useMemo(
    () => (rawProducts ?? []).map(mapItemToProduct),
    [rawProducts]
  );

  const receipts = useMemo(
    () => (rawReceipts ?? []).map(mapReceipt),
    [rawReceipts]
  );

  const archivedReceipts = useMemo(
    () => (rawArchivedReceipts ?? []).map(mapReceipt),
    [rawArchivedReceipts]
  );

  const workOrders = rawWorkOrders ?? [];
  const commissions = rawCommissions ?? [];

  const loading = loadingProducts || loadingReceipts || loadingArchived || loadingOrders || loadingCommissions;

  // --- Products ---

  async function addProduct(data: Omit<Product, "id">): Promise<string | null> {
    if (isReadOnlyPlan(storePlan)) return null;
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        description: data.description || null,
        sku: data.sku,
        costPrice: data.costPrice || null,
        salePrice: data.price,
        stock: data.stock,
        isActive: data.active,
        storeId,
        branchId,
        categoryId: data.categoryId || null,
      }),
    });
    if (!res.ok) return null;
    const item = await res.json();
    const cat = item.category as { id: string; name: string } | null;
    const newProduct: Product = {
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
    };
    mutate(productsKey, (prev: Record<string, unknown>[] | undefined) => [item, ...(prev ?? [])], { revalidate: false });
    return newProduct.id;
  }

  async function updateProduct(id: string, data: Omit<Product, "id">) {
    if (isReadOnlyPlan(storePlan)) return;
    const res = await fetch(`/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        description: data.description || null,
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
    mutate(
      productsKey,
      (prev: Record<string, unknown>[] | undefined) =>
        (prev ?? []).map((p) => ((p.id as string) === id ? { ...item, imageUrl: data.imageUrl ?? (p.imageUrl as string) } : p)),
      { revalidate: false }
    );
  }

  async function deleteProduct(id: string) {
    if (isReadOnlyPlan(storePlan)) return;
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    mutate(
      productsKey,
      (prev: Record<string, unknown>[] | undefined) => (prev ?? []).filter((p) => (p.id as string) !== id),
      { revalidate: false }
    );
  }

  async function toggleProductActive(id: string, forceActive?: boolean) {
    if (isReadOnlyPlan(storePlan)) return;
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const newActive = forceActive !== undefined ? forceActive : !product.active;
    if (product.active === newActive) return;
    const res = await fetch(`/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: newActive }),
    });
    if (!res.ok) return;
    const item = await res.json();
    mutate(
      productsKey,
      (prev: Record<string, unknown>[] | undefined) =>
        (prev ?? []).map((p) => ((p.id as string) === id ? { ...p, isActive: item.isActive } : p)),
      { revalidate: false }
    );
  }

  function bulkSetActive(ids: string[], isActive: boolean) {
    if (isReadOnlyPlan(storePlan)) return;
    const idSet = new Set(ids);

    // 1 sola mutación optimista
    mutate(
      productsKey,
      (prev: Record<string, unknown>[] | undefined) =>
        (prev ?? []).map((p) =>
          idSet.has(p.id as string) ? { ...p, isActive } : p
        ),
      { revalidate: false }
    );

    // API calls en background, al terminar revalidar
    Promise.all(
      ids.map((id) =>
        fetch(`/api/items/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        })
      )
    ).then(() => {
      mutate(productsKey);
    }).catch((err) => {
      console.error("Error en bulkSetActive:", err);
      mutate(productsKey);
    });
  }

  function getProduct(id: string) {
    return products.find((p) => p.id === id);
  }

  function setProductImage(id: string, imageUrl: string) {
    mutate(
      productsKey,
      (prev: Record<string, unknown>[] | undefined) =>
        (prev ?? []).map((p) => ((p.id as string) === id ? { ...p, imageUrl } : p)),
      { revalidate: false }
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
    mutate(
      productsKey,
      (prev: Record<string, unknown>[] | undefined) =>
        (prev ?? []).map((p) => ((p.id as string) === id ? { ...p, category: item.category } : p)),
      { revalidate: false }
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
    mutate(commissionsKey, data, { revalidate: false });
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
        branchId,
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

    mutate(
      receiptsKey,
      (prev: Record<string, unknown>[] | undefined) => [receipt, ...(prev ?? [])],
      { revalidate: false }
    );

    // Update local stock
    mutate(
      productsKey,
      (prev: Record<string, unknown>[] | undefined) =>
        (prev ?? []).map((p) => {
          const sold = data.items
            .filter((i) => i.productId === (p.id as string))
            .reduce((sum, i) => sum + i.quantity, 0);
          if (sold === 0) return p;
          return { ...p, stock: Math.max(0, (p.stock as number) - sold) };
        }),
      { revalidate: false }
    );
  }

  async function deleteReceipt(id: string) {
    if (isReadOnlyPlan(storePlan)) return;
    const receipt = receipts.find((r) => r.id === id) || archivedReceipts.find((r) => r.id === id);
    const res = await fetch(`/api/receipts/${id}`, { method: "DELETE" });
    if (!res.ok) return;

    mutate(
      receiptsKey,
      (prev: Record<string, unknown>[] | undefined) => (prev ?? []).filter((r) => (r.id as string) !== id),
      { revalidate: false }
    );
    mutate(
      archivedReceiptsKey,
      (prev: Record<string, unknown>[] | undefined) => (prev ?? []).filter((r) => (r.id as string) !== id),
      { revalidate: false }
    );

    // Restore local stock
    if (receipt) {
      mutate(
        productsKey,
        (prev: Record<string, unknown>[] | undefined) =>
          (prev ?? []).map((p) => {
            const restored = receipt.items
              .filter((i) => i.productId === (p.id as string))
              .reduce((sum, i) => sum + i.quantity, 0);
            if (restored === 0) return p;
            return { ...p, stock: (p.stock as number) + restored };
          }),
        { revalidate: false }
      );
    }
  }

  async function archiveReceipt(id: string) {
    if (isReadOnlyPlan(storePlan)) return;
    const res = await fetch(`/api/receipts/${id}`, { method: "PATCH" });
    if (!res.ok) return;
    const receipt = (rawReceipts ?? []).find((r) => (r.id as string) === id);
    mutate(
      receiptsKey,
      (prev: Record<string, unknown>[] | undefined) => (prev ?? []).filter((r) => (r.id as string) !== id),
      { revalidate: false }
    );
    if (receipt) {
      mutate(
        archivedReceiptsKey,
        (prev: Record<string, unknown>[] | undefined) => [receipt, ...(prev ?? [])],
        { revalidate: false }
      );
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
        branchId,
        branchName,
        branchSlug,
        products,
        addProduct,
        updateProduct,
        updateProductCategory,
        deleteProduct,
        toggleProductActive,
        bulkSetActive,
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
        refetchBranches,
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
