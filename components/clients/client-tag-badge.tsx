"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ClientTag } from "@/types/client";

const tagConfig: Record<ClientTag, { label: string; className: string }> = {
  NEW: { label: "Nuevo", className: "bg-blue-100 text-blue-800 border-blue-200" },
  RECURRING: { label: "Recurrente", className: "bg-green-100 text-green-800 border-green-200" },
  FREQUENT: { label: "Frecuente", className: "bg-purple-100 text-purple-800 border-purple-200" },
  VIP: { label: "VIP", className: "bg-amber-100 text-amber-800 border-amber-200" },
};

interface ClientTagBadgeProps {
  tag: ClientTag;
  className?: string;
}

export function ClientTagBadge({ tag, className }: ClientTagBadgeProps) {
  const config = tagConfig[tag];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
