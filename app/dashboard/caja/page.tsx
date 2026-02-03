"use client";

import { useState, useEffect, useCallback } from "react";
import { CashSummaryCards } from "@/components/stats/cash-summary-cards";
import { PeriodComparison } from "@/components/stats/period-comparison";
import { useDashboard } from "@/contexts/dashboard-context";

export default function CajaPage() {
  const { storeId } = useDashboard();
  const [period, setPeriod] = useState("today");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/stats/cash-summary?storeId=${storeId}&period=${period}`);
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }, [storeId, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Caja</h1>
        <PeriodComparison period={period} onPeriodChange={setPeriod} />
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando...</p>
      ) : data ? (
        <CashSummaryCards data={data as never} />
      ) : (
        <p className="text-sm text-neutral-500">No hay datos disponibles.</p>
      )}
    </div>
  );
}
