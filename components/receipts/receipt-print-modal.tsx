"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LuPrinter } from "react-icons/lu";
import { formatPrice } from "@/lib/utils";
import type { Receipt } from "@/types/receipt";

interface StoreSettings {
  logoUrl?: string | null;
  storeAddress?: string | null;
  phone?: string | null;
}

interface ReceiptPrintModalProps {
  open: boolean;
  onClose: () => void;
  receipt: Receipt;
  storeName: string;
  branchName: string;
  storeId: string;
}

function TemplateA4({
  receipt,
  storeName,
  branchName,
  settings,
}: {
  receipt: Receipt;
  storeName: string;
  branchName: string;
  settings: StoreSettings;
}) {
  const date = receipt.createdAt.toLocaleDateString("es-AR");
  const time = receipt.createdAt.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "20mm",
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        color: "#000",
        background: "#fff",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          {settings.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logoUrl} alt="Logo" style={{ height: "60px", marginBottom: "8px" }} />
          )}
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>{storeName}</div>
          {branchName && <div style={{ fontSize: "11px", color: "#555" }}>{branchName}</div>}
          {settings.storeAddress && <div style={{ fontSize: "11px", color: "#555" }}>{settings.storeAddress}</div>}
          {settings.phone && <div style={{ fontSize: "11px", color: "#555" }}>Tel: {settings.phone}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: "bold", fontSize: "18px", textTransform: "uppercase" }}>
            {receipt.receiptNumber.startsWith("PRE-") && receipt.status === "pendiente" ? "Resúmen de compra" : "Comprobante de pago"}
          </div>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>N° {receipt.receiptNumber}</div>
          <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>
            Fecha: {date} {time}
          </div>
        </div>
      </div>

      <hr style={{ borderTop: "1px solid #ccc", margin: "12px 0" }} />

      {/* Items table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #000" }}>
            <th style={{ textAlign: "left", padding: "6px 4px" }}>Descripción</th>
            <th style={{ textAlign: "right", padding: "6px 4px" }}>Cant.</th>
            <th style={{ textAlign: "right", padding: "6px 4px" }}>P. Unit.</th>
            <th style={{ textAlign: "right", padding: "6px 4px" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {receipt.items.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "5px 4px" }}>{item.name}</td>
              <td style={{ textAlign: "right", padding: "5px 4px" }}>{item.quantity}</td>
              <td style={{ textAlign: "right", padding: "5px 4px" }}>${formatPrice(item.unitPrice)}</td>
              <td style={{ textAlign: "right", padding: "5px 4px" }}>${formatPrice(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={{ borderTop: "1px solid #ccc", margin: "12px 0" }} />

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <table style={{ width: "220px" }}>
          <tbody>
            <tr style={{ borderTop: "2px solid #000" }}>
              <td style={{ padding: "6px 0", fontWeight: "bold", fontSize: "14px" }}>TOTAL</td>
              <td style={{ textAlign: "right", padding: "6px 0", fontWeight: "bold", fontSize: "14px" }}>
                ${formatPrice(receipt.subtotal)}
              </td>
            </tr>
            {receipt.commissionRate > 0 && (
              <>
                <tr>
                  <td style={{ padding: "3px 0", color: "#555", fontSize: "11px" }}>
                    Comisión ({receipt.commissionRate}%)
                  </td>
                  <td style={{ textAlign: "right", padding: "3px 0", fontSize: "11px" }}>${formatPrice(receipt.commissionAmount)}</td>
                </tr>
                <tr>
                  <td style={{ padding: "3px 0", color: "#555", fontSize: "11px" }}>Total con comisión</td>
                  <td style={{ textAlign: "right", padding: "3px 0", fontSize: "11px" }}>${formatPrice(receipt.total)}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Payment method */}
      <div style={{ marginTop: "12px", fontSize: "11px", color: "#555" }}>
        Método de pago: <strong>{receipt.paymentMethod}</strong>
      </div>

      {receipt.notes && (
        <div style={{ marginTop: "8px", fontSize: "11px", color: "#555" }}>
          Notas: {receipt.notes}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: "40px", borderTop: "1px solid #ccc", paddingTop: "10px", fontSize: "10px", color: "#888", textAlign: "center" }}>
        Este comprobante es una constancia de pago y no reemplaza a la factura oficial.
      </div>
    </div>
  );
}

function TemplateTicket({
  receipt,
  storeName,
  branchName,
  settings,
}: {
  receipt: Receipt;
  storeName: string;
  branchName: string;
  settings: StoreSettings;
}) {
  const date = receipt.createdAt.toLocaleDateString("es-AR");
  const time = receipt.createdAt.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const SEP = "================================";

  return (
    <div
      style={{
        width: "80mm",
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#000",
        background: "#fff",
        padding: "4mm",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "13px" }}>{storeName}</div>
      {branchName && <div style={{ textAlign: "center", fontSize: "10px" }}>{branchName}</div>}
      {settings.storeAddress && <div style={{ textAlign: "center", fontSize: "10px" }}>{settings.storeAddress}</div>}
      {settings.phone && <div style={{ textAlign: "center", fontSize: "10px" }}>Tel: {settings.phone}</div>}

      <div style={{ margin: "4px 0", fontSize: "10px" }}>{SEP}</div>

      <div style={{ fontSize: "10px" }}>{receipt.receiptNumber.startsWith("PRE-") && receipt.status === "pendiente" ? "Presupuesto" : "Comprobante"} N° {receipt.receiptNumber}</div>
      <div style={{ fontSize: "10px" }}>Fecha: {date}  Hora: {time}</div>

      <div style={{ margin: "4px 0", fontSize: "10px" }}>{SEP}</div>

      {/* Items */}
      {receipt.items.map((item) => {
        const desc = item.name.length > 20 ? item.name.slice(0, 19) + "…" : item.name;
        const lineTotal = `$${formatPrice(item.lineTotal)}`;
        const middle = ` ${item.quantity}x$${formatPrice(item.unitPrice)}`;
        const spaces = Math.max(1, 32 - desc.length - middle.length - lineTotal.length);
        return (
          <div key={item.id} style={{ fontSize: "10px", whiteSpace: "pre" }}>
            {desc}{middle}{" ".repeat(spaces)}{lineTotal}
          </div>
        );
      })}

      <div style={{ margin: "4px 0", fontSize: "10px" }}>{SEP}</div>

      <div style={{ fontSize: "14px", fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
        <span>TOTAL</span><span>${formatPrice(receipt.subtotal)}</span>
      </div>

      {receipt.commissionRate > 0 && (
        <>
          <div style={{ fontSize: "10px", display: "flex", justifyContent: "space-between" }}>
            <span>Comisión ({receipt.commissionRate}%)</span><span>${formatPrice(receipt.commissionAmount)}</span>
          </div>
          <div style={{ fontSize: "10px", display: "flex", justifyContent: "space-between" }}>
            <span>Total c/comisión</span><span>${formatPrice(receipt.total)}</span>
          </div>
        </>
      )}

      <div style={{ margin: "4px 0", fontSize: "10px" }}>{SEP}</div>

      <div style={{ fontSize: "10px" }}>Pago: {receipt.paymentMethod}</div>

      <div style={{ margin: "4px 0", fontSize: "10px" }}>{SEP}</div>

      <div style={{ textAlign: "center", fontSize: "9px", color: "#555" }}>
        Este comprobante no reemplaza la factura oficial.
      </div>
      <div style={{ textAlign: "center", fontSize: "11px", fontWeight: "bold", marginTop: "4px" }}>
        ¡Gracias!
      </div>
    </div>
  );
}

export function ReceiptPrintModal({
  open,
  onClose,
  receipt,
  storeName,
  branchName,
  storeId,
}: ReceiptPrintModalProps) {
  const [format, setFormat] = useState<"a4" | "ticket">("a4");
  const [settings, setSettings] = useState<StoreSettings>({});

  useEffect(() => {
    if (!open || !storeId) return;
    fetch(`/api/store-settings?storeId=${storeId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data) setSettings({ logoUrl: data.logoUrl, storeAddress: data.storeAddress, phone: data.phone });
      })
      .catch(() => {});
  }, [open, storeId]);

  function handlePrint() {
    window.print();
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-content, #print-content * { visibility: visible !important; }
          #print-content { position: fixed !important; top: 0 !important; left: 0 !important; }
          @page { size: ${format === "a4" ? "A4" : "80mm auto"}; margin: 0; }
        }
      `}</style>

      {open && (
        <div
          id="print-content"
          style={{ position: "fixed", left: "-9999px", top: 0, visibility: "hidden" }}
          aria-hidden="true"
        >
          {format === "a4" ? (
            <TemplateA4
              receipt={receipt}
              storeName={storeName}
              branchName={branchName}
              settings={settings}
            />
          ) : (
            <TemplateTicket
              receipt={receipt}
              storeName={storeName}
              branchName={branchName}
              settings={settings}
            />
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Imprimir recibo</DialogTitle>
          </DialogHeader>

          {/* Format selector */}
          <div className="flex gap-2">
            <Button
              variant={format === "a4" ? "default" : "outline"}
              size="sm"
              onClick={() => setFormat("a4")}
            >
              A4
            </Button>
            <Button
              variant={format === "ticket" ? "default" : "outline"}
              size="sm"
              onClick={() => setFormat("ticket")}
            >
              Ticket 80mm
            </Button>
          </div>

          {/* Preview */}
          <div className="flex-1 overflow-auto bg-neutral-100 rounded p-4 flex justify-center">
            <div style={{ transform: format === "a4" ? "scale(0.55)" : "scale(0.85)", transformOrigin: "top center" }}>
              {format === "a4" ? (
                <TemplateA4
                  receipt={receipt}
                  storeName={storeName}
                  branchName={branchName}
                  settings={settings}
                />
              ) : (
                <TemplateTicket
                  receipt={receipt}
                  storeName={storeName}
                  branchName={branchName}
                  settings={settings}
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handlePrint}>
              <LuPrinter className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
