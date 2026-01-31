"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useDashboard } from "@/contexts/dashboard-context";
import { LuArrowLeft, LuChevronDown } from "react-icons/lu";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function SalesPage() {
  const { receipts } = useDashboard();
  const [openReceiptId, setOpenReceiptId] = useState<string | null>(null);

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

  const currentMonthTotal = currentMonthReceipts.reduce((s, r) => s + r.total, 0);

  const toggle = (id: string) =>
    setOpenReceiptId((prev) => (prev === id ? null : id));

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

      {currentMonthReceipts.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 px-4 py-8 text-center">
          <p className="text-sm text-neutral-500">No hay ventas en este mes.</p>
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
                    ${r.total.toFixed(2)}
                  </span>
                  <LuChevronDown
                    className={`h-3.5 w-3.5 text-neutral-500 transition-transform ${
                      openReceiptId === r.id ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {openReceiptId === r.id && (
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
                          ${item.lineTotal.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between border-t border-neutral-200 pt-1.5 text-xs font-semibold text-neutral-900">
                    <span>Total recibo</span>
                    <span>${r.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-900">
            <span>Total del mes ({currentMonthReceipts.length} recibos)</span>
            <span>${currentMonthTotal.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
