"use client";

import { StatusBadge } from "./status-badge";
import type { OrderStatusLog, OrderStatus } from "@/types/work-order";

interface OrderTimelineProps {
  logs: OrderStatusLog[];
}

export function OrderTimeline({ logs }: OrderTimelineProps) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-neutral-500 py-2">No hay cambios de estado registrados.</p>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log, index) => (
        <div key={log.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-neutral-300 mt-1" />
            {index < logs.length - 1 && (
              <div className="w-px flex-1 bg-neutral-200 mt-1" />
            )}
          </div>
          <div className="pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={log.fromStatus} className="text-xs" />
              <span className="text-xs text-neutral-400">→</span>
              <StatusBadge status={log.toStatus} className="text-xs" />
            </div>
            {log.message && (
              <p className="text-sm text-neutral-700 mt-1">{log.message}</p>
            )}
            <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
              <span>{log.changedBy?.name ?? "Sistema"}</span>
              <span>·</span>
              <span>{new Date(log.createdAt).toLocaleString("es-AR")}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
