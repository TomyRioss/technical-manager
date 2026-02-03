"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RepairsByMonth } from "@/components/stats/repairs-by-month";
import { CommonFaults } from "@/components/stats/common-faults";
import { TechnicianStats } from "@/components/stats/technician-stats";
import { useDashboard } from "@/contexts/dashboard-context";
import { LuWrench, LuCheck, LuDollarSign } from "react-icons/lu";

interface StatsData {
  summary: { totalOrders: number; deliveredOrders: number; totalRevenue: number };
  byMonth: { month: string; count: number; revenue: number }[];
  commonFaults: { fault: string; count: number }[];
  technicianStats: { name: string; total: number; delivered: number; revenue: number }[];
}

export default function EstadisticasPage() {
  const { storeId } = useDashboard();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/stats/business?storeId=${storeId}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [storeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <p className="text-sm text-neutral-500">Cargando estadísticas...</p>;
  if (!data) return <p className="text-sm text-neutral-500">No hay datos.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Estadísticas</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Total Órdenes</CardTitle>
            <LuWrench className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.summary.totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Entregados</CardTitle>
            <LuCheck className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.summary.deliveredOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Ingresos</CardTitle>
            <LuDollarSign className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${data.summary.totalRevenue.toLocaleString("es-AR")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RepairsByMonth data={data.byMonth} />
        <CommonFaults data={data.commonFaults} />
      </div>

      <TechnicianStats data={data.technicianStats} />
    </div>
  );
}
