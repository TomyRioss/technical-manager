"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MonthData {
  month: string;
  count: number;
  revenue: number;
}

interface RepairsByMonthProps {
  data: MonthData[];
}

export function RepairsByMonth({ data }: RepairsByMonthProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Reparaciones por Mes</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-neutral-500">Sin datos.</p>
        ) : (
          <div className="space-y-3">
            {data.map((d) => (
              <div key={d.month} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">{d.month}</span>
                  <span className="font-medium">
                    {d.count} — ${d.revenue.toLocaleString("es-AR")}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-neutral-800"
                    style={{ width: `${(d.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
