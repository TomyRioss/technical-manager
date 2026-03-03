import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { PaymentMethod, ReceiptStatus } from "@/lib/generated/prisma";
import { checkReadOnly } from "@/lib/plan-guard";

const paymentMethodMap: Record<string, PaymentMethod> = {
  "Efectivo": "CASH",
  "Transferencia Debito": "DEBIT_TRANSFER",
  "Transferencia Credito": "CREDIT_TRANSFER",
  "Otro": "OTHER",
};

const statusMap: Record<string, ReceiptStatus> = {
  "pagado": "COMPLETED",
  "pendiente": "PENDING",
  "anulado": "CANCELLED",
};

interface ReceiptRow {
  Número: string;
  Estado?: string;
  "Método de Pago"?: string;
  Subtotal?: string | number;
  Comisión?: string | number;
  Total?: string | number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeId, branchId, receipts } = body as { storeId: string; branchId: string; receipts: ReceiptRow[] };

    if (!storeId || !branchId || !Array.isArray(receipts) || receipts.length === 0) {
      return NextResponse.json({ error: "Datos inválidos o incompletos" }, { status: 400 });
    }

    const guard = await checkReadOnly(storeId);
    if (guard) return guard;

    // Need a userId for the receipt; use any admin of the store
    const storeUser = await prisma.storeUser.findFirst({ where: { storeId } });
    if (!storeUser) {
      return NextResponse.json({ error: "No se encontró un usuario de la tienda" }, { status: 400 });
    }

    let count = 0;

    for (const row of receipts) {
      if (!row.Número) continue;

      const receiptNumber = String(row.Número).trim();
      const rawStatus = row.Estado ? String(row.Estado).toLowerCase() : "pagado";
      const status: ReceiptStatus = statusMap[rawStatus] ?? "COMPLETED";
      const rawMethod = row["Método de Pago"] ? String(row["Método de Pago"]).trim() : "Efectivo";
      const paymentMethod: PaymentMethod = paymentMethodMap[rawMethod] ?? "CASH";
      const subtotal = row.Subtotal ? parseFloat(String(row.Subtotal)) : 0;
      const commissionAmount = row.Comisión ? parseFloat(String(row.Comisión)) : 0;
      const total = row.Total ? parseFloat(String(row.Total)) : subtotal - commissionAmount;

      await prisma.receipt.upsert({
        where: { receiptNumber_storeId: { receiptNumber, storeId } },
        update: { status, paymentMethod, subtotal, commissionAmount, total },
        create: {
          receiptNumber,
          status,
          paymentMethod,
          subtotal,
          commissionRate: 0,
          commissionAmount,
          total,
          storeId,
          branchId,
          userId: storeUser.userId,
        },
      });

      count++;
    }

    return NextResponse.json({ count });
  } catch (error: unknown) {
    console.error("POST /api/receipts/bulk error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un recibo con ese número" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al importar recibos" }, { status: 500 });
  }
}
