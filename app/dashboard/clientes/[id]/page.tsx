"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ClientDetail } from "@/components/clients/client-detail";
import type { Client } from "@/types/client";
import { LuArrowLeft } from "react-icons/lu";

export default function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <p className="text-sm text-neutral-500">Cargando cliente...</p>;
  }

  if (!client) {
    return <p className="text-sm text-red-500">Cliente no encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/clientes")}>
        <LuArrowLeft className="h-4 w-4 mr-1" />
        Volver a Clientes
      </Button>
      <ClientDetail client={client} />
    </div>
  );
}
