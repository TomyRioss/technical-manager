import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { PaymentMethod, ReceiptStatus } from "@/lib/generated/prisma";

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
  if (!storeId) {
    return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
  }

  const receipts = await prisma.receipt.findMany({
    where: { storeId, isActive: true },
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
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { storeId, userId, paymentMethod, commissionRate, commissionAmount, subtotal, total, notes, items } = body;

  if (!storeId || !userId || !paymentMethod || !items?.length) {
    return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 });
  }

  const dbPaymentMethod = paymentMethodMap[paymentMethod];
  if (!dbPaymentMethod) {
    return NextResponse.json({ error: "Método de pago inválido" }, { status: 400 });
  }

  // Generate receipt number
  const count = await prisma.receipt.count({ where: { storeId } });
  const receiptNumber = `REC-${String(count + 1).padStart(3, "0")}`;

  const receipt = await prisma.$transaction(async (tx) => {
    // Create receipt with items
    const created = await tx.receipt.create({
      data: {
        receiptNumber,
        status: "PENDING",
        paymentMethod: dbPaymentMethod,
        subtotal,
        commissionRate: commissionRate || 0,
        commissionAmount: commissionAmount || 0,
        total,
        notes: notes || null,
        storeId,
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

    // Discount stock
    for (const i of items) {
      await tx.item.update({
        where: { id: i.productId },
        data: { stock: { decrement: i.quantity } },
      });
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
}
