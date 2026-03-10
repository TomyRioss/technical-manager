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

const paymentMethodReverseMap: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  DEBIT_TRANSFER: "Transferencia Debito",
  CREDIT_TRANSFER: "Transferencia Credito",
  OTHER: "Otro",
};

const statusReverseMap: Record<ReceiptStatus, string> = {
  PENDING: "pendiente",
  COMPLETED: "pagado",
  CANCELLED: "anulado",
};

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("storeId");
  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!storeId) {
    return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
  }

  const archived = req.nextUrl.searchParams.get("archived") === "true";

  try {
    const where: Record<string, unknown> = { storeId, isActive: !archived };
    if (branchId && branchId !== "null" && branchId !== "undefined") where.branchId = branchId;

    const receipts = await prisma.receipt.findMany({
      where,
      include: { items: { include: { item: true } } },
      orderBy: { createdAt: "desc" },
    });

    const mapped = receipts.map((r) => ({
      id: r.id,
      receiptNumber: r.receiptNumber,
      status: statusReverseMap[r.status],
      paymentMethod: paymentMethodReverseMap[r.paymentMethod],
      subtotal: r.subtotal,
      commissionRate: r.commissionRate,
      commissionAmount: r.commissionAmount,
      total: r.total,
      notes: r.notes || "",
      items: r.items.map((ri) => ({
        id: ri.id,
        productId: ri.itemId,
        name: ri.item.name,
        quantity: ri.quantity,
        unitPrice: ri.unitPrice,
        lineTotal: ri.lineTotal,
      })),
      createdAt: r.createdAt,
    }));

    return NextResponse.json(mapped);
  } catch (error: unknown) {
    console.error("GET /api/receipts error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al obtener los recibos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { storeId, branchId, userId, paymentMethod, commissionRate, commissionAmount, subtotal, total, notes, items } = body;

  if (!storeId || !branchId || !userId || !paymentMethod || !items?.length) {
    return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 });
  }

  const guard = await checkReadOnly(storeId);
  if (guard) return guard;

  const dbPaymentMethod = paymentMethodMap[paymentMethod];
  if (!dbPaymentMethod) {
    return NextResponse.json({ error: "Método de pago inválido" }, { status: 400 });
  }

  const isQuote = body.isQuote === true;

  try {
    // Generate receipt number
    let receiptNumber: string;
    if (isQuote) {
      const preReceipts = await prisma.receipt.findMany({
        where: { storeId, receiptNumber: { startsWith: "PRE-" } },
        select: { receiptNumber: true },
      });
      const maxPre = preReceipts.reduce((max, r) => {
        const num = parseInt(r.receiptNumber.replace("PRE-", "")) || 0;
        return Math.max(max, num);
      }, 0);
      receiptNumber = `PRE-${String(maxPre + 1).padStart(3, "0")}`;
    } else {
      const recCount = await prisma.receipt.count({
        where: { storeId, receiptNumber: { not: { startsWith: "PRE-" } } },
      });
      receiptNumber = `REC-${String(recCount + 1).padStart(3, "0")}`;
    }

    const receipt = await prisma.$transaction(async (tx) => {
      // Create receipt with items
      const created = await tx.receipt.create({
        data: {
          receiptNumber,
          status: isQuote ? "PENDING" : "COMPLETED",
          paymentMethod: dbPaymentMethod,
          subtotal,
          commissionRate: commissionRate || 0,
          commissionAmount: commissionAmount || 0,
          total,
          notes: notes || null,
          storeId,
          branchId,
          userId,
          items: {
            create: items.map((i: { productId: string; quantity: number; unitPrice: number; lineTotal: number }) => ({
              itemId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              lineTotal: i.lineTotal,
            })),
          },
        },
        include: { items: { include: { item: true } } },
      });

      // Discount stock only for real receipts (not quotes)
      if (!isQuote) {
        for (const i of items) {
          await tx.item.update({
            where: { id: i.productId },
            data: { stock: { decrement: i.quantity } },
          });
        }
      }

      return created;
    });

    const mapped = {
      id: receipt.id,
      receiptNumber: receipt.receiptNumber,
      status: statusReverseMap[receipt.status],
      paymentMethod: paymentMethodReverseMap[receipt.paymentMethod],
      subtotal: receipt.subtotal,
      commissionRate: receipt.commissionRate,
      commissionAmount: receipt.commissionAmount,
      total: receipt.total,
      notes: receipt.notes || "",
      items: receipt.items.map((ri) => ({
        id: ri.id,
        productId: ri.itemId,
        name: ri.item.name,
        quantity: ri.quantity,
        unitPrice: ri.unitPrice,
        lineTotal: ri.lineTotal,
      })),
      createdAt: receipt.createdAt,
    };

    return NextResponse.json(mapped, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/receipts error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al crear el recibo" }, { status: 500 });
  }
}
