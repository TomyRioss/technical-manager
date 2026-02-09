"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useDashboard } from "@/contexts/dashboard-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LuArrowLeft, LuChevronDown } from "react-icons/lu";
import { formatPrice } from "@/lib/utils";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function SalesPage() {
  const { receipts, workOrders } = useDashboard();
  const [openReceiptIds, setOpenReceiptIds] = useState<Set<string>>(new Set());

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthReceipts = useMemo(
    () =>
      receipts
        .filter((r) => {
          const d = new Date(r.createdAt);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [receipts, currentMonth, currentYear]
  );

  const currentMonthOrders = useMemo(
    () =>
      workOrders
        .filter((o) => {
          if (o.status !== "ENTREGADO") return false;
          const d = new Date(o.updatedAt);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [workOrders, currentMonth, currentYear]
  );

  const receiptsTotal = currentMonthReceipts.reduce((s, r) => s + r.total, 0);
  const ordersTotal = currentMonthOrders.reduce((s, o) => s + (o.agreedPrice || 0), 0);
  const totalMonth = receiptsTotal + ordersTotal;

  const toggle = (id: string) =>
    setOpenReceiptIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 transition-colors hover:bg-neutral-50"
        >
          <LuArrowLeft className="h-3.5 w-3.5 text-neutral-700" />
        </Link>
        <h1 className="text-sm font-semibold text-neutral-900">
          Ventas del mes — {MONTH_NAMES[currentMonth]} {currentYear}
        </h1>
      </div>

      <div className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-900">
        <span>Total del mes</span>
        <span>${formatPrice(totalMonth)}</span>
      </div>

      <Tabs defaultValue="recibos" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="recibos" className="flex-1">
            Recibos (${formatPrice(receiptsTotal)})
          </TabsTrigger>
          <TabsTrigger value="ordenes" className="flex-1">
            Ordenes (${formatPrice(ordersTotal)})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recibos" className="mt-4">
          {currentMonthReceipts.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 px-4 py-8 text-center">
              <p className="text-sm text-neutral-500">No hay recibos en este mes.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentMonthReceipts.map((r) => (
                <div key={r.id} className="rounded-md border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => toggle(r.id)}
                    className="flex w-full items-center justify-between px-3 py-2 text-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900">
                        {r.receiptNumber}
                      </span>
                      <span className="text-neutral-500">{r.paymentMethod}</span>
                      <span className="text-neutral-400">
                        {r.items.length} {r.items.length === 1 ? "prod." : "prods."}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-neutral-900">
                        ${formatPrice(r.total)}
                      </span>
                      <LuChevronDown
                        className={`h-3.5 w-3.5 text-neutral-500 transition-transform ${
                          openReceiptIds.has(r.id) ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {openReceiptIds.has(r.id) && (
                    <div className="border-t border-neutral-100 px-3 pb-2">
                      <ul className="divide-y divide-neutral-50">
                        {r.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between py-1.5 text-xs"
                          >
                            <div>
                              <span className="text-neutral-700">{item.name}</span>
                              <span className="ml-1.5 text-neutral-400">
                                x{item.quantity}
                              </span>
                            </div>
                            <span className="text-neutral-700">
                              ${formatPrice(item.lineTotal)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-between border-t border-neutral-200 pt-1.5 text-xs font-semibold text-neutral-900">
                        <span>Total recibo</span>
                        <span>${formatPrice(r.total)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-900">
                <span>Subtotal recibos ({currentMonthReceipts.length})</span>
                <span>${formatPrice(receiptsTotal)}</span>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ordenes" className="mt-4">
          {currentMonthOrders.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 px-4 py-8 text-center">
              <p className="text-sm text-neutral-500">No hay ordenes entregadas en este mes.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentMonthOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-xs"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-neutral-900">{o.orderCode}</span>
                    <span className="text-neutral-500">{o.deviceModel}</span>
                    {o.client && (
                      <span className="text-neutral-400">{o.client.name}</span>
                    )}
                  </div>
                  <span className="font-medium text-neutral-900">
                    ${formatPrice(o.agreedPrice || 0)}
                  </span>
                </div>
              ))}

              <div className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-900">
                <span>Subtotal ordenes ({currentMonthOrders.length})</span>
                <span>${formatPrice(ordersTotal)}</span>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
