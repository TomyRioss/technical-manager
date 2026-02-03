"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/work-order";

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  RECIBIDO: { label: "Recibido", className: "bg-blue-100 text-blue-800 border-blue-200" },
  EN_REVISION: { label: "En revisión", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  ESPERANDO_REPUESTO: { label: "Esperando repuesto", className: "bg-orange-100 text-orange-800 border-orange-200" },
  EN_REPARACION: { label: "En reparación", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  LISTO_PARA_RETIRAR: { label: "Listo para retirar", className: "bg-green-100 text-green-800 border-green-200" },
  ENTREGADO: { label: "Entregado", className: "bg-neutral-100 text-neutral-800 border-neutral-200" },
  SIN_REPARACION: { label: "Sin reparación", className: "bg-red-100 text-red-800 border-red-200" },
};

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export function getStatusLabel(status: OrderStatus): string {
  return statusConfig[status]?.label ?? status;
}
