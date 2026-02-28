"use client";

import { useState } from "react";
import Link from "next/link";
import { LuArrowLeft, LuCheck } from "react-icons/lu";
import { useDashboard } from "@/contexts/dashboard-context";
import { PosProductGrid } from "@/components/pos/pos-product-grid";
import { PosCart } from "@/components/pos/pos-cart";
import { PosWorkOrderModal } from "@/components/pos/pos-work-order-modal";
import { ReceiptPrintModal } from "@/components/receipts/receipt-print-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";
import type { CartItem, WorkOrderFormData } from "@/types/pos";
import type { Receipt } from "@/types/receipt";

export default function PosPage() {
  const { products, storeId, branchId, userId, storeName, branchName, getCommissionRate, loading } = useDashboard();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [commissionRate, setCommissionRate] = useState(0);
  const [workOrderModalProduct, setWorkOrderModalProduct] = useState<Product | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<Receipt | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  function handlePaymentMethodChange(method: string) {
    setPaymentMethod(method);
    setCommissionRate(getCommissionRate(method));
  }

  function addToCart(product: Product, workOrderData?: WorkOrderFormData) {
    setCart((prev) => {
      if (workOrderData) {
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            product,
            quantity: 1,
            unitPrice: workOrderData.agreedPrice || product.price,
            workOrder: workOrderData,
          },
        ];
      }
      const existing = prev.find((i) => i.product.id === product.id && !i.workOrder);
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          product,
          quantity: 1,
          unitPrice: product.price,
        },
      ];
    });
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  }

  async function handleCheckout() {
    if (!paymentMethod) {
      setCheckoutError("Seleccioná un método de pago");
      return;
    }
    if (cart.length === 0) {
      setCheckoutError("El carrito está vacío");
      return;
    }
    setChecking(true);
    setCheckoutError(null);
    try {
      const subtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      const commissionAmount = (subtotal * commissionRate) / 100;
      const total = subtotal + commissionAmount;
      const items = cart.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        lineTotal: i.unitPrice * i.quantity,
      }));

      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          branchId,
          userId,
          paymentMethod,
          subtotal,
          commissionRate,
          commissionAmount,
          total,
          notes: "",
          items,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al crear el recibo");
      }

      const receiptData = await res.json();
      const receipt: Receipt = { ...receiptData, createdAt: new Date(receiptData.createdAt) };

      for (const item of cart.filter((i) => i.workOrder)) {
        const wo = item.workOrder!;
        const woRes = await fetch("/api/work-orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceModel: wo.deviceModel,
            reportedFault: wo.reportedFault,
            faultTags: wo.faultTags,
            agreedPrice: wo.agreedPrice,
            clientId: wo.clientId,
            technicianId: wo.technicianId || undefined,
            createdById: userId,
            storeId,
            branchId,
            internalNotes: wo.internalNotes || undefined,
            warrantyDays: wo.warrantyDays ? parseInt(wo.warrantyDays) : undefined,
            partsCost: wo.partsCost || 0,
          }),
        });
        if (!woRes.ok) {
          const woData = await woRes.json().catch(() => ({}));
          console.error("Error al crear OT:", woData.error);
        }
      }

      setCart([]);
      setPaymentMethod("");
      setCommissionRate(0);
      setSuccessReceipt(receipt);
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Error al procesar el cobro");
    } finally {
      setChecking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-neutral-500">Cargando...</p>
      </div>
    );
  }

  return (
    <>
    <div className="flex flex-col gap-3 h-[calc(100vh-8rem)]">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
          <LuArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
      </div>
    <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
      <div className="flex-1 min-w-0 overflow-hidden">
        <PosProductGrid
          products={products}
          onAddProduct={(product) => addToCart(product)}
          onAddService={(product) => setWorkOrderModalProduct(product)}
        />
      </div>

      <div className="w-full lg:w-80 xl:w-96 border border-neutral-200 rounded-lg p-4 overflow-hidden flex flex-col shrink-0">
        <PosCart
          items={cart}
          paymentMethod={paymentMethod}
          commissionRate={commissionRate}
          onPaymentMethodChange={handlePaymentMethodChange}
          onCommissionRateChange={setCommissionRate}
          onUpdateQty={updateQty}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
          checking={checking}
          error={checkoutError}
        />
      </div>

      {workOrderModalProduct && (
        <PosWorkOrderModal
          product={workOrderModalProduct}
          storeId={storeId}
          branchId={branchId}
          onConfirm={(workOrderData) => {
            addToCart(workOrderModalProduct, workOrderData);
            setWorkOrderModalProduct(null);
          }}
          onCancel={() => setWorkOrderModalProduct(null)}
        />
      )}
    </div>
    </div>

    {/* Modal de éxito */}
    <Dialog open={!!successReceipt && !showPrintModal} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
              <LuCheck className="h-5 w-5 text-green-600" />
            </div>
            <DialogTitle>Orden procesada con éxito</DialogTitle>
          </div>
        </DialogHeader>
        {successReceipt && (
          <p className="text-sm text-neutral-500">Recibo N° {successReceipt.receiptNumber}</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => { setShowPrintModal(true); }}>
            Imprimir
          </Button>
          <Button onClick={() => setSuccessReceipt(null)}>
            Aceptar
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {successReceipt && showPrintModal && (
      <ReceiptPrintModal
        open={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        receipt={successReceipt}
        storeName={storeName}
        branchName={branchName}
        storeId={storeId}
      />
    )}
    </>
  );
}
