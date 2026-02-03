"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OrderDetail } from "@/components/orders/order-detail";
import type { WorkOrder } from "@/types/work-order";
import { LuArrowLeft } from "react-icons/lu";

export default function OrdenDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    const res = await fetch(`/api/work-orders/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setOrder(data);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetchOrder().finally(() => setLoading(false));
  }, [fetchOrder]);

  if (loading) {
    return <p className="text-sm text-neutral-500">Cargando orden...</p>;
  }

  if (!order) {
    return <p className="text-sm text-red-500">Orden no encontrada.</p>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/ordenes")}>
        <LuArrowLeft className="h-4 w-4 mr-1" />
        Volver a Órdenes
      </Button>
      <OrderDetail order={order} onRefresh={fetchOrder} />
    </div>
  );
}
