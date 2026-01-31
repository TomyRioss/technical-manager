"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useDashboard } from "@/contexts/dashboard-context";
import { Badge } from "@/components/ui/badge";
import {
  LuWarehouse,
  LuReceipt,
  LuTriangleAlert,
  LuTrendingUp,
  LuTrendingDown,
} from "react-icons/lu";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function DashboardPage() {
  const { products, receipts } = useDashboard();

  const lowStock = products.filter((p) => p.stock <= 5 && p.active);
  const recentReceipts = receipts.slice(-5).reverse();
  const totalProducts = products.length;
  const totalReceipts = receipts.length;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthReceipts = useMemo(
    () =>
      receipts.filter((r) => {
        const d = new Date(r.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }),
    [receipts, currentMonth, currentYear]
  );

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const prevMonthReceipts = useMemo(
    () =>
      receipts.filter((r) => {
        const d = new Date(r.createdAt);
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      }),
    [receipts, prevMonth, prevYear]
  );

  const currentMonthTotal = currentMonthReceipts.reduce((s, r) => s + r.total, 0);
  const prevMonthTotal = prevMonthReceipts.reduce((s, r) => s + r.total, 0);

  const percentChange =
    prevMonthTotal > 0
      ? ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100
      : currentMonthTotal > 0
        ? 100
        : 0;


  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-neutral-900">Inicio</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">Productos</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">
            {totalProducts}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">Bajo stock</p>
          <p className="mt-1 text-2xl font-semibold text-orange-600">
            {lowStock.length}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">Recibos</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">
            {totalReceipts}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">Ingresos totales</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">
            ${receipts.reduce((s, r) => s + r.total, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Ventas del mes */}
      <Link
        href="/dashboard/sales"
        className="block w-full rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-500">
              Ventas del mes — {MONTH_NAMES[currentMonth]} {currentYear}
            </p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900">
              ${currentMonthTotal.toFixed(2)}
            </p>
          </div>
          {percentChange !== 0 && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                percentChange > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {percentChange > 0 ? (
                <LuTrendingUp className="h-4 w-4" />
              ) : (
                <LuTrendingDown className="h-4 w-4" />
              )}
              <span>
                {percentChange > 0 ? "+" : ""}
                {percentChange.toFixed(1)}% vs {MONTH_NAMES[prevMonth]}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Bajo stock + Recibos recientes */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Bajo stock */}
        <div className="rounded-lg border border-neutral-200">
          <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3">
            <LuTriangleAlert className="h-4 w-4 text-orange-500" />
            <p className="text-sm font-semibold text-neutral-900">
              Productos con bajo stock
            </p>
          </div>
          {lowStock.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-neutral-500">
              No hay productos con stock bajo.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {lowStock.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <span className="text-neutral-900">{p.name}</span>
                  <Badge variant={p.stock === 0 ? "destructive" : "secondary"}>
                    {p.stock} uds.
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recibos recientes */}
        <div className="rounded-lg border border-neutral-200">
          <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3">
            <LuReceipt className="h-4 w-4 text-neutral-500" />
            <p className="text-sm font-semibold text-neutral-900">
              Recibos recientes
            </p>
          </div>
          {recentReceipts.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-neutral-500">
              No hay recibos aún.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {recentReceipts.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-neutral-900">
                      {r.receiptNumber}
                    </span>
                    <span className="text-neutral-500">
                      {r.paymentMethod}
                    </span>
                  </div>
                  <span className="font-medium text-neutral-900">
                    ${r.total.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Cards de navegación */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/inventario"
          className="flex items-center gap-4 rounded-lg border border-neutral-200 p-5 transition-colors hover:bg-neutral-50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-neutral-100">
            <LuWarehouse className="h-5 w-5 text-neutral-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">Inventario</p>
            <p className="text-sm text-neutral-500">
              Gestionar productos y stock
            </p>
          </div>
        </Link>
        <Link
          href="/dashboard/recibos"
          className="flex items-center gap-4 rounded-lg border border-neutral-200 p-5 transition-colors hover:bg-neutral-50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-neutral-100">
            <LuReceipt className="h-5 w-5 text-neutral-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">Recibos</p>
            <p className="text-sm text-neutral-500">
              Crear y consultar recibos de venta
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
