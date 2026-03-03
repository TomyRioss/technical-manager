import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkReadOnly } from "@/lib/plan-guard";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !["COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido. Debe ser COMPLETED o CANCELLED" },
        { status: 400 }
      );
    }

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!receipt) {
      return NextResponse.json(
        { error: "Recibo no encontrado" },
        { status: 404 }
      );
    }

    if (receipt.status !== "PENDING") {
      return NextResponse.json(
        { error: "Solo se pueden modificar pedidos pendientes" },
        { status: 400 }
      );
    }

    const guard = await checkReadOnly(receipt.storeId);
    if (guard) return guard;

    if (status === "COMPLETED") {
      // Transaction: update status + deduct stock
      await prisma.$transaction(async (tx) => {
        await tx.receipt.update({
          where: { id },
          data: { status: "COMPLETED" },
        });

        for (const item of receipt.items) {
          await tx.item.update({
            where: { id: item.itemId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      });
    } else {
      // CANCELLED: just update status
      await prisma.receipt.update({
        where: { id },
        data: { status: "CANCELLED" },
      });
    }

    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error("Error en PATCH /api/receipts/[id]/status:", err);
    return NextResponse.json(
      { error: "Error interno al actualizar el pedido" },
      { status: 500 }
    );
  }
}
