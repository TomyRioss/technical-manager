import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { PaymentMethod, ReceiptStatus } from "@/lib/generated/prisma";

const paymentMethodReverseMap: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  POSNET: "Posnet",
  TRANSFER: "Transferencia",
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

  const receipt = await prisma.receipt.findUnique({
    where: { id },
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
  await prisma.receipt.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
