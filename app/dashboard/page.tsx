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
  LuClipboardList,
  LuUsers,
  LuSearch,
  LuStore,
  LuCopy,
  LuQrCode,
  LuExternalLink,
} from "react-icons/lu";
import { formatPrice } from "@/lib/utils";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function DashboardPage() {
  const { products, receipts, workOrders, storeSlug, userRole } = useDashboard();
  const isOwner = userRole === "OWNER";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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

  const deliveredOrders = useMemo(
    () => workOrders.filter((o) => o.status === "ENTREGADO"),
    [workOrders]
  );

  const currentMonthOrders = useMemo(
    () =>
      deliveredOrders.filter((o) => {
        const d = new Date(o.updatedAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }),
    [deliveredOrders, currentMonth, currentYear]
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

  const prevMonthOrders = useMemo(
    () =>
      deliveredOrders.filter((o) => {
        const d = new Date(o.updatedAt);
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      }),
    [deliveredOrders, prevMonth, prevYear]
  );

  const currentMonthReceiptsTotal = currentMonthReceipts.reduce((s, r) => s + r.total, 0);
  const currentMonthOrdersTotal = currentMonthOrders.reduce((s, o) => s + (o.agreedPrice || 0), 0);
  const currentMonthTotal = currentMonthReceiptsTotal + currentMonthOrdersTotal;

  const prevMonthReceiptsTotal = prevMonthReceipts.reduce((s, r) => s + r.total, 0);
  const prevMonthOrdersTotal = prevMonthOrders.reduce((s, o) => s + (o.agreedPrice || 0), 0);
  const prevMonthTotal = prevMonthReceiptsTotal + prevMonthOrdersTotal;

  const percentChange =
    prevMonthTotal > 0
      ? ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100
      : currentMonthTotal > 0
        ? 100
        : 0;

  // Calcular utilidades netas del mes actual
  const currentMonthNetProfit = useMemo(() => {
    return currentMonthReceipts.reduce((total, receipt) => {
      return total + receipt.items.reduce((itemTotal, item) => {
        const product = products.find(p => p.id === item.productId);
        const costPrice = product?.costPrice ?? 0;
        const profit = (item.unitPrice - costPrice) * item.quantity;
        return itemTotal + profit;
      }, 0);
    }, 0);
  }, [currentMonthReceipts, products]);

  // Calcular utilidades del mes anterior para comparación
  const prevMonthNetProfit = useMemo(() => {
    return prevMonthReceipts.reduce((total, receipt) => {
      return total + receipt.items.reduce((itemTotal, item) => {
        const product = products.find(p => p.id === item.productId);
        const costPrice = product?.costPrice ?? 0;
        const profit = (item.unitPrice - costPrice) * item.quantity;
        return itemTotal + profit;
      }, 0);
    }, 0);
  }, [prevMonthReceipts, products]);

  const profitPercentChange = prevMonthNetProfit > 0
    ? ((currentMonthNetProfit - prevMonthNetProfit) / prevMonthNetProfit) * 100
    : currentMonthNetProfit > 0 ? 100 : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-neutral-900">Inicio</h1>

      {/* Cards de navegación */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isOwner && (
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
        )}
        <Link
          href="/dashboard/recibos/create"
          className="flex items-center gap-4 rounded-lg border border-neutral-200 p-5 transition-colors hover:bg-neutral-50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-neutral-100">
            <LuReceipt className="h-5 w-5 text-neutral-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">{isOwner ? "Recibos" : "Crear Recibo"}</p>
            <p className="text-sm text-neutral-500">
              {isOwner ? "Crear y consultar recibos de venta" : "Generar recibo de venta"}
            </p>
          </div>
        </Link>
        <Link
          href="/dashboard/ordenes"
          className="flex items-center gap-4 rounded-lg border border-neutral-200 p-5 transition-colors hover:bg-neutral-50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-neutral-100">
            <LuClipboardList className="h-5 w-5 text-neutral-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">Ordenes</p>
            <p className="text-sm text-neutral-500">
              Gestionar órdenes de trabajo
            </p>
          </div>
        </Link>
        <Link
          href="/dashboard/clientes"
          className="flex items-center gap-4 rounded-lg border border-neutral-200 p-5 transition-colors hover:bg-neutral-50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-neutral-100">
            <LuUsers className="h-5 w-5 text-neutral-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">Clientes</p>
            <p className="text-sm text-neutral-500">
              Administrar clientes
            </p>
          </div>
        </Link>
      </div>

      {/* Accesos públicos */}
      {storeSlug && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center gap-4">
              <Link href={`/${storeSlug}`} target="_blank" className="flex flex-1 cursor-pointer items-center gap-4 rounded-md hover:bg-blue-100 -m-2 p-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-100">
                  <LuSearch className="h-5 w-5 text-blue-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900">Acceder al buscador</p>
                  <p className="text-sm text-blue-600">Página de seguimiento de órdenes</p>
                </div>
                <LuExternalLink className="h-4 w-4 text-blue-700" />
              </Link>
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                readOnly
                value={`${appUrl}/${storeSlug}`}
                className="flex-1 rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs text-neutral-700"
              />
              <button
                onClick={() => navigator.clipboard.writeText(`${appUrl}/${storeSlug}`)}
                className="flex cursor-pointer items-center gap-1 rounded-md bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200"
              >
                <LuCopy className="h-3.5 w-3.5" />
                Copiar
              </button>
              <button
                onClick={async () => {
                  const url = `${appUrl}/${storeSlug}`;
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
                  const response = await fetch(qrUrl);
                  const blob = await response.blob();
                  const blobUrl = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = blobUrl;
                  a.download = `qr-buscador-${storeSlug}.png`;
                  a.click();
                  URL.revokeObjectURL(blobUrl);
                }}
                className="flex cursor-pointer items-center gap-1 rounded-md bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200"
              >
                <LuQrCode className="h-3.5 w-3.5" />
                QR
              </button>
            </div>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-5">
            <div className="flex items-center gap-4">
              <Link href={`/${storeSlug}/tienda`} target="_blank" className="flex flex-1 cursor-pointer items-center gap-4 rounded-md hover:bg-green-100 -m-2 p-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-green-100">
                  <LuStore className="h-5 w-5 text-green-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900">Acceder a la tienda</p>
                  <p className="text-sm text-green-600">Tienda online de productos</p>
                </div>
                <LuExternalLink className="h-4 w-4 text-green-700" />
              </Link>
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                readOnly
                value={`${appUrl}/${storeSlug}/tienda`}
                className="flex-1 rounded-md border border-green-200 bg-white px-3 py-1.5 text-xs text-neutral-700"
              />
              <button
                onClick={() => navigator.clipboard.writeText(`${appUrl}/${storeSlug}/tienda`)}
                className="flex cursor-pointer items-center gap-1 rounded-md bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200"
              >
                <LuCopy className="h-3.5 w-3.5" />
                Copiar
              </button>
              <button
                onClick={async () => {
                  const url = `${appUrl}/${storeSlug}/tienda`;
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
                  const response = await fetch(qrUrl);
                  const blob = await response.blob();
                  const blobUrl = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = blobUrl;
                  a.download = `qr-tienda-${storeSlug}.png`;
                  a.click();
                  URL.revokeObjectURL(blobUrl);
                }}
                className="flex cursor-pointer items-center gap-1 rounded-md bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200"
              >
                <LuQrCode className="h-3.5 w-3.5" />
                QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ventas del mes y Utilidades Netas - solo OWNER */}
      {isOwner && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Card Ventas del mes */}
          <Link
            href="/dashboard/sales"
            className="block rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500">
                  Ventas del mes — {MONTH_NAMES[currentMonth]} {currentYear}
                </p>
                <p className="mt-1 text-2xl font-semibold text-neutral-900">
                  ${formatPrice(currentMonthTotal)}
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

          {/* Card Utilidades Netas */}
          <div className="rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500">
                  Utilidades Netas — {MONTH_NAMES[currentMonth]} {currentYear}
                </p>
                <p className="mt-1 text-2xl font-semibold text-green-600">
                  ${formatPrice(currentMonthNetProfit)}
                </p>
              </div>
              {profitPercentChange !== 0 && (
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    profitPercentChange > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {profitPercentChange > 0 ? (
                    <LuTrendingUp className="h-4 w-4" />
                  ) : (
                    <LuTrendingDown className="h-4 w-4" />
                  )}
                  <span>
                    {profitPercentChange > 0 ? "+" : ""}
                    {profitPercentChange.toFixed(1)}% vs {MONTH_NAMES[prevMonth]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bajo stock + Recibos recientes - solo OWNER */}
      {isOwner && (
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
              <ul className="max-h-[250px] divide-y divide-neutral-100 overflow-y-auto">
                {lowStock.map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/inventario/${p.id}/edit`}
                    className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-neutral-50"
                  >
                    <span className="text-neutral-900">{p.name}</span>
                    <Badge variant={p.stock === 0 ? "destructive" : "secondary"}>
                      {p.stock} uds.
                    </Badge>
                  </Link>
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
              <ul className="max-h-[250px] divide-y divide-neutral-100 overflow-y-auto">
                {recentReceipts.map((r) => (
                  <Link
                    key={r.id}
                    href={`/dashboard/recibos/${r.id}`}
                    className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-neutral-50"
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
                      ${formatPrice(r.total)}
                    </span>
                  </Link>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
