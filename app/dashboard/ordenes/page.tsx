"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderCard } from "@/components/orders/order-card";
import { OrderTable } from "@/components/orders/order-table";
import { OrderFilters } from "@/components/orders/order-filters";
import { useDashboard } from "@/contexts/dashboard-context";
import { cn } from "@/lib/utils";
import type { WorkOrder } from "@/types/work-order";
import { LuPlus, LuSearch, LuLayoutGrid, LuList } from "react-icons/lu";
import Link from "next/link";

type ViewTab = "todas" | "mias" | "activas";

export default function OrdenesPage() {
  const { storeId, userId } = useDashboard();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<ViewTab>("todas");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [technicianFilter, setTechnicianFilter] = useState("ALL");
  const [technicians, setTechnicians] = useState<{ id: string; name: string }[]>([]);

  const fetchOrders = useCallback(async () => {
    const res = await fetch(`/api/work-orders?storeId=${storeId}`);
    if (!res.ok) return;
    const data = await res.json();
    setOrders(data);
  }, [storeId]);

  useEffect(() => {
    setLoading(true);
    fetchOrders().finally(() => setLoading(false));
  }, [fetchOrders]);

  useEffect(() => {
    async function fetchTechnicians() {
      const res = await fetch(`/api/users?storeId=${storeId}`);
      if (res.ok) setTechnicians(await res.json());
    }
    fetchTechnicians();
  }, [storeId]);

  const filtered = orders.filter((o) => {
    // Tab filter
    if (tab === "mias" && o.technicianId !== userId) return false;
    if (tab === "activas" && (o.status === "ENTREGADO" || o.status === "SIN_REPARACION")) return false;

    // Status filter
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false;

    // Technician filter
    if (technicianFilter === "UNASSIGNED" && o.technicianId !== null) return false;
    if (technicianFilter !== "ALL" && technicianFilter !== "UNASSIGNED" && o.technicianId !== technicianFilter) return false;

    // Search
    if (search) {
      const q = search.toLowerCase();
      return (
        o.orderCode.toLowerCase().includes(q) ||
        o.deviceModel.toLowerCase().includes(q) ||
        o.client?.name.toLowerCase().includes(q) ||
        o.reportedFault.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const tabs: { key: ViewTab; label: string }[] = [
    { key: "todas", label: "Todas" },
    { key: "mias", label: "Mis Órdenes" },
    { key: "activas", label: "Activas" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Órdenes de Trabajo</h1>
        <Link href="/dashboard/ordenes/create">
          <Button>
            <LuPlus className="h-4 w-4 mr-1" />
            Nueva Orden
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "pb-2 text-sm font-medium border-b-2 transition-colors",
              tab === t.key
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            )}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 pb-2">
          <button
            onClick={() => setViewMode("grid")}
            className={cn("p-1.5 rounded", viewMode === "grid" ? "bg-neutral-100" : "")}
          >
            <LuLayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={cn("p-1.5 rounded", viewMode === "table" ? "bg-neutral-100" : "")}
          >
            <LuList className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <OrderFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          technicianFilter={technicianFilter}
          onTechnicianChange={setTechnicianFilter}
          technicians={technicians}
        />
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando órdenes...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-8">
          No hay órdenes que coincidan.
        </p>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <OrderTable orders={filtered} />
      )}
    </div>
  );
}
