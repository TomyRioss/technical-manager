"use client";

import { useMemo, useState } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LuShoppingCart,
  LuCheck,
  LuX,
  LuLoaderCircle,
} from "react-icons/lu";
import { useSWRConfig } from "swr";

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface OnlineReceipt {
  id: string;
  receiptNumber: string;
  status: string;
  total: number;
  notes: string;
  items: OrderItem[];
  createdAt: Date;
}

export function OnlineOrdersSection() {
  const { receipts, loading, storeId, branchId } = useDashboard();
  const { mutate } = useSWRConfig();

  const [selectedOrder, setSelectedOrder] = useState<OnlineReceipt | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const onlineOrders = useMemo(() => {
    return receipts.filter(
      (r) => r.status === "pendiente" && r.notes?.includes("[PEDIDO ONLINE]")
    ) as OnlineReceipt[];
  }, [receipts]);

  const handleAction = async (id: string, status: "COMPLETED" | "CANCELLED") => {
    setActionLoading(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/receipts/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar el pedido");
      }

      // Revalidate receipts and products
      mutate(`/api/receipts?storeId=${storeId}&branchId=${branchId}`);
      mutate(`/api/items?storeId=${storeId}&branchId=${branchId}`);
      setSelectedOrder(null);
    } catch (err) {
      console.error("Error updating order:", err);
      setActionError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-neutral-200">
        <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3">
          <LuShoppingCart className="h-4 w-4 text-blue-500" />
          <p className="text-sm font-semibold text-neutral-900">Pedidos online</p>
        </div>
        <div className="flex items-center justify-center gap-2 px-4 py-6">
          <LuLoaderCircle className="h-5 w-5 animate-spin text-neutral-400" />
          <span className="text-sm text-neutral-500">Cargando datos...</span>
        </div>
      </div>
    );
  }

  if (onlineOrders.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200">
        <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3">
          <LuShoppingCart className="h-4 w-4 text-blue-500" />
          <p className="text-sm font-semibold text-neutral-900">Pedidos online</p>
        </div>
        <p className="px-4 py-6 text-center text-sm text-neutral-500">
          No hay pedidos online.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-blue-200 bg-blue-50/50">
        <div className="flex items-center gap-2 border-b border-blue-200 px-4 py-3">
          <LuShoppingCart className="h-4 w-4 text-blue-500" />
          <p className="text-sm font-semibold text-neutral-900">Pedidos online</p>
          <Badge className="ml-auto bg-blue-100 text-blue-700 hover:bg-blue-100">
            {onlineOrders.length}
          </Badge>
        </div>
        <ul className="max-h-[250px] divide-y divide-blue-100 overflow-y-auto">
          {onlineOrders.map((order) => (
            <button
              key={order.id}
              onClick={() => {
                setSelectedOrder(order);
                setActionError(null);
              }}
              className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-sm hover:bg-blue-100/50"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-neutral-900">
                  {order.receiptNumber}
                </span>
                <span className="text-neutral-500">
                  {order.items.length} {order.items.length === 1 ? "item" : "items"}
                </span>
              </div>
              <span className="font-medium text-neutral-900">
                ${formatPrice(order.total)}
              </span>
            </button>
          ))}
        </ul>
      </div>

      {/* Detail dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LuShoppingCart className="h-5 w-5" />
              Pedido {selectedOrder?.receiptNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-500">
                {new Date(selectedOrder.createdAt).toLocaleString("es-AR")}
              </p>

              {/* Items table */}
              <div className="rounded-md border border-neutral-200">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50">
                    <tr className="border-b border-neutral-200">
                      <th className="px-3 py-2 text-left font-medium text-neutral-600">
                        Producto
                      </th>
                      <th className="px-3 py-2 text-center font-medium text-neutral-600">
                        Cant.
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-neutral-600">
                        Precio
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-neutral-600">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 text-neutral-900">
                          {item.name}
                        </td>
                        <td className="px-3 py-2 text-center text-neutral-600">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2 text-right text-neutral-600">
                          ${formatPrice(item.unitPrice)}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-neutral-900">
                          ${formatPrice(item.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
                <span className="text-base font-bold text-neutral-900">Total</span>
                <span className="text-base font-bold text-neutral-900">
                  ${formatPrice(selectedOrder.total)}
                </span>
              </div>

              {actionError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {actionError}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(selectedOrder.id, "COMPLETED")}
                  disabled={actionLoading}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <LuLoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <LuCheck className="h-4 w-4" />
                  )}
                  Confirmar
                </button>
                <button
                  onClick={() => handleAction(selectedOrder.id, "CANCELLED")}
                  disabled={actionLoading}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <LuLoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <LuX className="h-4 w-4" />
                  )}
                  Rechazar
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
