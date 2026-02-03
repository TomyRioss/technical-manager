"use client";

import { useState, useEffect, useCallback } from "react";
import { UnretrievedAlert } from "./unretrieved-alert";
import { useDashboard } from "@/contexts/dashboard-context";

interface UnretrievedOrder {
  id: string;
  orderCode: string;
  deviceModel: string;
  clientName: string;
  daysReady: number;
}

export function AlertsList() {
  const { storeId } = useDashboard();
  const [unretrieved, setUnretrieved] = useState<UnretrievedOrder[]>([]);

  const fetchUnretrieved = useCallback(async () => {
    const res = await fetch(`/api/work-orders?storeId=${storeId}&status=LISTO_PARA_RETIRAR`);
    if (!res.ok) return;
    const orders = await res.json();

    const now = Date.now();
    const alerts: UnretrievedOrder[] = orders
      .map((o: Record<string, unknown>) => {
        const updatedAt = new Date(o.updatedAt as string).getTime();
        const daysReady = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));
        return {
          id: o.id,
          orderCode: o.orderCode,
          deviceModel: o.deviceModel,
          clientName: (o.client as Record<string, unknown>)?.name ?? "—",
          daysReady,
        };
      })
      .filter((o: UnretrievedOrder) => o.daysReady >= 3)
      .sort((a: UnretrievedOrder, b: UnretrievedOrder) => b.daysReady - a.daysReady);

    setUnretrieved(alerts);
  }, [storeId]);

  useEffect(() => {
    fetchUnretrieved();
  }, [fetchUnretrieved]);

  return <UnretrievedAlert orders={unretrieved} />;
}
