"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { OrderForm } from "@/components/orders/order-form";
import { useStorePlan } from "@/hooks/use-store-plan";

export default function CrearOrdenPage() {
  const { isReadOnly } = useStorePlan();
  const router = useRouter();

  useEffect(() => {
    if (isReadOnly) {
      router.replace("/dashboard/ordenes");
    }
  }, [isReadOnly, router]);

  if (isReadOnly) return null;

  return (
    <div className="space-y-6">
      <OrderForm />
    </div>
  );
}
