"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { WarrantyStatus } from "@/types/work-order";

const warrantyConfig: Record<WarrantyStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Garantía activa", className: "bg-green-100 text-green-800 border-green-200" },
  EXPIRED: { label: "Garantía vencida", className: "bg-red-100 text-red-800 border-red-200" },
  CLAIMED: { label: "Garantía reclamada", className: "bg-orange-100 text-orange-800 border-orange-200" },
};

interface WarrantyBadgeProps {
  status: WarrantyStatus;
  className?: string;
}

export function WarrantyBadge({ status, className }: WarrantyBadgeProps) {
  const config = warrantyConfig[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
