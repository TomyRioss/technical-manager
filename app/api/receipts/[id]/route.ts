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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
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
  } catch (error: unknown) {
    console.error("GET /api/receipts/[id] error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al obtener el recibo" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const existing = await prisma.receipt.findUnique({ where: { id }, select: { storeId: true } });
    if (existing) {
      const guard = await checkReadOnly(existing.storeId);
      if (guard) return guard;
    }

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
  } catch (error: unknown) {
    console.error("DELETE /api/receipts/[id] error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al eliminar el recibo" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const existing = await prisma.receipt.findUnique({
      where: { id },
      select: { storeId: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
    }
    if (existing.status !== "PENDING") {
      return NextResponse.json({ error: "Solo se pueden editar presupuestos pendientes" }, { status: 400 });
    }

    const guard = await checkReadOnly(existing.storeId);
    if (guard) return guard;

    const body = await req.json();
    const { paymentMethod, commissionRate, notes, items } = body as {
      paymentMethod: string;
      commissionRate: number;
      notes: string;
      items: { id: string; quantity: number; unitPrice: number }[];
    };

    const pmKey = paymentMethodMap[paymentMethod] ?? "CASH";
    const rate = Number(commissionRate) || 0;
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const commissionAmount = subtotal * rate / 100;
    const total = subtotal - commissionAmount;

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.receiptItem.update({
          where: { id: item.id },
          data: {
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.quantity * item.unitPrice,
          },
        });
      }
      await tx.receipt.update({
        where: { id },
        data: {
          paymentMethod: pmKey,
          commissionRate: rate,
          commissionAmount,
          subtotal,
          total,
          notes: notes || null,
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("PUT /api/receipts/[id] error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2025") return NextResponse.json({ error: "Ítem no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al actualizar el presupuesto" }, { status: 500 });
  }
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const existingReceipt = await prisma.receipt.findUnique({ where: { id }, select: { storeId: true } });
    if (existingReceipt) {
      const guard = await checkReadOnly(existingReceipt.storeId);
      if (guard) return guard;
    }

    await prisma.receipt.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("PATCH /api/receipts/[id] error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al archivar el recibo" }, { status: 500 });
  }
}
