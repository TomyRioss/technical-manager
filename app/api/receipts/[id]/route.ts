import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { PaymentMethod, ReceiptStatus } from "@/lib/generated/prisma";

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const receipt = await prisma.receipt.findFirst({
    where: { id, isActive: true },
    include: { items: { include: { item: true } } },
  });

  if (!receipt) {
    return NextResponse.json({ error: "Recibo no encontrado" }, { status: 404 });
  }

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

  return NextResponse.json(mapped);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.$transaction(async (tx) => {
    const receipt = await tx.receipt.findUniqueOrThrow({
      where: { id },
      include: { items: true },
    });

    // Restore stock for each item
    for (const ri of receipt.items) {
      await tx.item.update({
        where: { id: ri.itemId },
        data: { stock: { increment: ri.quantity } },
      });
    }

    await tx.receipt.delete({ where: { id } });
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.receipt.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
