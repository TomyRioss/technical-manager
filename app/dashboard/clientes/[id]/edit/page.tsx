"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ClientForm } from "@/components/clients/client-form";
import type { Client } from "@/types/client";
import { LuArrowLeft } from "react-icons/lu";

export default function EditClientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchClient = useCallback(async () => {
    const res = await fetch(`/api/clients/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setClient(data);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetchClient().finally(() => setLoading(false));
  }, [fetchClient]);

  async function handleUpdate(data: { name: string; phone: string; email: string; notes: string }) {
    setSaving(true);
    const res = await fetch(`/api/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push(`/dashboard/clientes/${id}`);
    }
    setSaving(false);
  }

  if (loading) {
    return <p className="text-sm text-neutral-500">Cargando cliente...</p>;
  }

  if (!client) {
    return <p className="text-sm text-red-500">Cliente no encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/dashboard/clientes/${id}`)}>
          <LuArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-neutral-900">Editar Cliente</h1>
      </div>
      <div className="max-w-lg mx-auto">
        <ClientForm
          client={client}
          onSubmit={handleUpdate}
          onCancel={() => router.push(`/dashboard/clientes/${id}`)}
          loading={saving}
        />
      </div>
    </div>
  );
}
