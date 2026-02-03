"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface OrderSummary {
  id: string;
  orderCode: string;
  deviceModel: string;
  status: string;
  agreedPrice: number | null;
  createdAt: string;
}

interface ClientHistoryProps {
  orders: OrderSummary[];
}

const statusLabels: Record<string, string> = {
  RECIBIDO: "Recibido",
  EN_REVISION: "En revisión",
  ESPERANDO_REPUESTO: "Esperando repuesto",
  EN_REPARACION: "En reparación",
  LISTO_PARA_RETIRAR: "Listo para retirar",
  ENTREGADO: "Entregado",
  SIN_REPARACION: "Sin reparación",
};

export function ClientHistory({ orders }: ClientHistoryProps) {
  if (orders.length === 0) {
    return (
      <p className="text-sm text-neutral-500 py-4">
        Este cliente no tiene órdenes de trabajo.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/dashboard/ordenes/${order.id}`}
          className="block rounded-lg border border-border p-3 hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{order.orderCode}</span>
            <Badge variant="outline" className="text-xs">
              {statusLabels[order.status] ?? order.status}
            </Badge>
          </div>
          <p className="text-sm text-neutral-600 mt-1">{order.deviceModel}</p>
          <div className="flex items-center justify-between mt-2 text-xs text-neutral-500">
            <span>{new Date(order.createdAt).toLocaleDateString("es-AR")}</span>
            {order.agreedPrice != null && (
              <span>${order.agreedPrice.toLocaleString("es-AR")}</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
