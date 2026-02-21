"use client";

import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LuTrash2, LuMinus, LuPlus, LuShoppingCart, LuLoaderCircle } from "react-icons/lu";

interface TiendaCartDrawerProps {
  slug: string;
  branchId: string;
  whatsappNumber: string | null;
}

export function TiendaCartDrawer({ slug, branchId, whatsappNumber }: TiendaCartDrawerProps) {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const total = getTotal();
  const itemCount = getItemCount();

  const handleOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const orderItems = items.map((item) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.salePrice,
        lineTotal: item.salePrice * item.quantity,
      }));

      const res = await fetch("/api/tienda/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, branchId, items: orderItems }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear el pedido");
      }

      const { receiptNumber } = await res.json();

      // Build WhatsApp message
      if (whatsappNumber) {
        const itemLines = items
          .map((i) => `- ${i.name} x${i.quantity} ($${formatPrice(i.salePrice * i.quantity)})`)
          .join("\n");
        const msg = encodeURIComponent(
          `Hola! Hice un pedido online (${receiptNumber}):\n\n${itemLines}\n\nTotal: $${formatPrice(total)}\n\nQuedo a la espera de confirmación.`
        );
        window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank");
      }

      clearCart();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsCartOpen(false);
      }, 3000);
    } catch (err) {
      console.error("Error creating order:", err);
      setError(err instanceof Error ? err.message : "Error al crear el pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <LuShoppingCart className="h-5 w-5" />
            Tu carrito
            {itemCount > 0 && (
              <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs text-white">
                {itemCount}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {success ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <LuShoppingCart className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-center text-sm font-medium text-green-700">
              Pedido creado con éxito
            </p>
            <p className="text-center text-xs text-neutral-500">
              Te redirigimos a WhatsApp para confirmar
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4">
            <LuShoppingCart className="h-12 w-12 text-neutral-300" />
            <p className="text-sm text-neutral-500">Tu carrito está vacío</p>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-4">
              <div className="divide-y divide-neutral-100">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 py-4">
                    {/* Thumbnail */}
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-16 w-16 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-neutral-100">
                        <span className="text-lg text-neutral-400">
                          {item.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-neutral-900 line-clamp-2">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-2 shrink-0 cursor-pointer rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-red-500"
                        >
                          <LuTrash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="mt-0.5 text-xs text-neutral-500">
                        ${formatPrice(item.salePrice)} c/u
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-neutral-200 hover:bg-neutral-100"
                          >
                            <LuMinus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-neutral-200 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <LuPlus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-neutral-900">
                          ${formatPrice(item.salePrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-200 px-4 py-4">
              {error && (
                <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="mb-2 flex items-center justify-between text-sm text-neutral-500">
                <span>Subtotal</span>
                <span>${formatPrice(total)}</span>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-base font-bold text-neutral-900">Total</span>
                <span className="text-base font-bold text-neutral-900">
                  ${formatPrice(total)}
                </span>
              </div>

              <button
                onClick={handleOrder}
                disabled={loading || items.length === 0}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <LuLoaderCircle className="h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Hacer pedido"
                )}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
