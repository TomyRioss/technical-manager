"use client";

import Link from "next/link";
import { LuTriangleAlert } from "react-icons/lu";

interface UnretrievedOrder {
  id: string;
  orderCode: string;
  deviceModel: string;
  clientName: string;
  daysReady: number;
}

interface UnretrievedAlertProps {
  orders: UnretrievedOrder[];
}

export function UnretrievedAlert({ orders }: UnretrievedAlertProps) {
  if (orders.length === 0) return null;

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <LuTriangleAlert className="h-5 w-5 text-orange-600" />
        <h3 className="font-medium text-orange-800">
          {orders.length} equipo{orders.length > 1 ? "s" : ""} sin retirar
        </h3>
      </div>
      <div className="space-y-2">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/dashboard/ordenes/${order.id}`}
            className="block rounded-md bg-white p-2 border border-orange-100 hover:bg-orange-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{order.orderCode}</span>
              <span className="text-xs text-orange-700">{order.daysReady} días</span>
            </div>
            <p className="text-xs text-neutral-600 mt-0.5">
              {order.deviceModel} — {order.clientName}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
