"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientTable } from "@/components/clients/client-table";
import { useDashboard } from "@/contexts/dashboard-context";
import type { Client } from "@/types/client";
import { LuPlus, LuSearch } from "react-icons/lu";
import Link from "next/link";

export default function ClientesPage() {
  const { storeId } = useDashboard();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchClients = useCallback(async () => {
    const res = await fetch(`/api/clients?storeId=${storeId}`);
    if (!res.ok) return;
    const data = await res.json();
    setClients(data);
  }, [storeId]);

  useEffect(() => {
    setLoading(true);
    fetchClients().finally(() => setLoading(false));
  }, [fetchClients]);

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Link href="/dashboard/clientes/create">
          <Button>
            <LuPlus className="h-4 w-4 mr-1" />
            Nuevo Cliente
          </Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Buscar por nombre, teléfono o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando clientes...</p>
      ) : (
        <ClientTable
          clients={filtered}
          onDelete={(id) => setClients((prev) => prev.filter((c) => c.id !== id))}
        />
      )}
    </div>
  );
}
