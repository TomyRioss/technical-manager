"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientTable } from "@/components/clients/client-table";
import { useDashboard } from "@/contexts/dashboard-context";
import type { Client } from "@/types/client";
import { LuPlus, LuSearch } from "react-icons/lu";
import Link from "next/link";
import { useStorePlan } from "@/hooks/use-store-plan";

export default function ClientesPage() {
  const { storeId, branchId } = useDashboard();
  const { isReadOnly } = useStorePlan();
  const [search, setSearch] = useState("");

  const clientsKey = `/api/clients?storeId=${storeId}&branchId=${branchId}`;
  const { data: clients = [], isLoading: loading, mutate } = useSWR<Client[]>(clientsKey);

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
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="relative w-full sm:w-auto sm:max-w-sm sm:flex-1">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Buscar por nombre, teléfono o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="ml-auto">
          <Link href="/dashboard/clientes/create" className={isReadOnly ? "pointer-events-none" : ""}>
            <Button disabled={isReadOnly}>
              <LuPlus className="h-4 w-4 mr-1" />
              Nuevo Cliente
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando clientes...</p>
      ) : (
        <ClientTable
          clients={filtered}
          onDelete={(id) => mutate((prev) => (prev ?? []).filter((c) => c.id !== id), { revalidate: false })}
        />
      )}
    </div>
  );
}
