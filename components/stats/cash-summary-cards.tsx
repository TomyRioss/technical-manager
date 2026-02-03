"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LuDollarSign, LuWrench, LuReceipt, LuPercent } from "react-icons/lu";

interface CashSummaryData {
  orders: { count: number; total: number; prevTotal: number };
  receipts: { count: number; total: number; prevTotal: number };
  commissions: number;
  grandTotal: number;
  prevGrandTotal: number;
}

interface CashSummaryCardsProps {
  data: CashSummaryData;
}

function ChangeIndicator({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const pct = ((current - previous) / previous) * 100;
  const isUp = pct >= 0;
  return (
    <span className={`text-xs ${isUp ? "text-green-600" : "text-red-600"}`}>
      {isUp ? "+" : ""}{pct.toFixed(0)}% vs anterior
    </span>
  );
}

export function CashSummaryCards({ data }: CashSummaryCardsProps) {
  const cards = [
    {
      title: "Ingresos Totales",
      value: data.grandTotal,
      prev: data.prevGrandTotal,
      icon: LuDollarSign,
    },
    {
      title: "Reparaciones",
      value: data.orders.total,
      prev: data.orders.prevTotal,
      icon: LuWrench,
      count: data.orders.count,
    },
    {
      title: "Ventas",
      value: data.receipts.total,
      prev: data.receipts.prevTotal,
      icon: LuReceipt,
      count: data.receipts.count,
    },
    {
      title: "Comisiones",
      value: data.commissions,
      prev: 0,
      icon: LuPercent,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${card.value.toLocaleString("es-AR", { minimumFractionDigits: 0 })}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {card.count != null && (
                <span className="text-xs text-neutral-500">{card.count} operaciones</span>
              )}
              <ChangeIndicator current={card.value} previous={card.prev} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
