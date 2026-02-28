"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types/pos";
import { LuBanknote, LuCreditCard, LuCircleDollarSign, LuEllipsis } from "react-icons/lu";

const PAYMENT_METHODS = [
  { label: "Efectivo", icon: LuBanknote },
  { label: "Transferencia Debito", icon: LuCreditCard },
  { label: "Transferencia Credito", icon: LuCircleDollarSign },
  { label: "Otro", icon: LuEllipsis },
];

interface PosCartProps {
  items: CartItem[];
  paymentMethod: string;
  commissionRate: number;
  onPaymentMethodChange: (method: string) => void;
  onCommissionRateChange: (rate: number) => void;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  checking: boolean;
  error: string | null;
}

export function PosCart({
  items,
  paymentMethod,
  commissionRate,
  onPaymentMethodChange,
  onCommissionRateChange,
  onUpdateQty,
  onRemove,
  onCheckout,
  checking,
  error,
}: PosCartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const commissionAmount = (subtotal * commissionRate) / 100;
  const total = subtotal + commissionAmount;

  return (
    <div className="flex flex-col h-full gap-4">
      <h2 className="text-base font-semibold">Carrito</h2>

      <div className="flex-1 overflow-y-auto space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-10">El carrito está vacío</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="border border-neutral-200 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight line-clamp-1">{item.product.name}</p>
                  {item.workOrder && (
                    <Badge variant="outline" className="text-[10px] mt-0.5">Servicio | OT</Badge>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="text-xs text-neutral-400 hover:text-red-500 shrink-0"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                    className="w-6 h-6 rounded border border-neutral-300 flex items-center justify-center text-sm hover:bg-neutral-100"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                    className="w-6 h-6 rounded border border-neutral-300 flex items-center justify-center text-sm hover:bg-neutral-100"
                  >
                    +
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-500">{formatPrice(item.unitPrice)} c/u</p>
                  <p className="text-sm font-semibold">{formatPrice(item.unitPrice * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3 border-t border-neutral-200 pt-3">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="space-y-2">
          <Label>Método de pago</Label>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => onPaymentMethodChange(label)}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                  paymentMethod === label
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-foreground border-border hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commissionRate">Comisión (%)</Label>
          <Input
            id="commissionRate"
            type="number"
            min={0}
            step={0.1}
            value={commissionRate}
            onChange={(e) => onCommissionRateChange(parseFloat(e.target.value) || 0)}
          />
        </div>

        {commissionRate > 0 && (
          <>
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Comisión ({commissionRate}%)</span>
              <span>{formatPrice(commissionAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Total sin comisión</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total con comisión</span>
              <span>{formatPrice(total)}</span>
            </div>
          </>
        )}

        {commissionRate === 0 && (
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          className="w-full"
          onClick={onCheckout}
          disabled={items.length === 0 || !paymentMethod || checking}
        >
          {checking ? "Procesando..." : "Cobrar"}
        </Button>
      </div>
    </div>
  );
}
