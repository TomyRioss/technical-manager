"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ClientForm } from "@/components/clients/client-form";
import { useDashboard } from "@/contexts/dashboard-context";
import { LuArrowLeft } from "react-icons/lu";

export default function CreateClientPage() {
  const router = useRouter();
  const { storeId } = useDashboard();
  const [saving, setSaving] = useState(false);

  async function handleCreate(data: { name: string; phone: string; email: string; notes: string }) {
    setSaving(true);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, storeId }),
    });
    if (res.ok) {
      router.push("/dashboard/clientes");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/dashboard/clientes")}>
          <LuArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-neutral-900">Nuevo Cliente</h1>
      </div>
      <div className="max-w-lg mx-auto">
        <ClientForm
          onSubmit={handleCreate}
          onCancel={() => router.push("/dashboard/clientes")}
          loading={saving}
        />
      </div>
    </div>
  );
}
