"use client";

import { OrderForm } from "@/components/orders/order-form";

export default function CrearOrdenPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nueva Orden de Trabajo</h1>
      <OrderForm />
    </div>
  );
}
