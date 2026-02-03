"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import type { WorkOrder } from "@/types/work-order";
import { LuUser, LuWrench } from "react-icons/lu";

interface OrderCardProps {
  order: WorkOrder;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Link href={`/dashboard/ordenes/${order.id}`}>
      <Card className="hover:bg-neutral-50 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">{order.orderCode}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm text-neutral-900 font-medium">{order.deviceModel}</p>
          <p className="text-sm text-neutral-600 mt-1 line-clamp-1">{order.reportedFault}</p>
          <div className="flex items-center justify-between mt-3 text-xs text-neutral-500">
            <div className="flex items-center gap-1">
              <LuUser className="h-3 w-3" />
              <span>{order.client?.name ?? "—"}</span>
            </div>
            {order.technician && (
              <div className="flex items-center gap-1">
                <LuWrench className="h-3 w-3" />
                <span>{order.technician.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-neutral-400">
            <span>{new Date(order.createdAt).toLocaleDateString("es-AR")}</span>
            {order.agreedPrice != null && (
              <span className="font-medium text-neutral-600">
                ${order.agreedPrice.toLocaleString("es-AR")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
