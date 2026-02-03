import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage, buildStatusChangeMessage } from "@/lib/whatsapp";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, message, changedById } = body;

    if (!status || !changedById) {
      return NextResponse.json(
        { error: "status y changedById son requeridos" },
        { status: 400 }
      );
    }

    const order = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        client: { select: { phone: true } },
        store: { select: { name: true, settings: { select: { slug: true } } } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    const fromStatus = order.status;

    // Build update data
    const updateData: Record<string, unknown> = { status };

    // If delivered, calculate warranty
    if (status === "ENTREGADO" && order.warrantyDays) {
      const now = new Date();
      const expires = new Date(now);
      expires.setDate(expires.getDate() + order.warrantyDays);
      updateData.warrantyExpires = expires;
      updateData.warrantyStatus = "ACTIVE";
    }

    // Update order + create status log in transaction
    const [updatedOrder] = await prisma.$transaction([
      prisma.workOrder.update({
        where: { id },
        data: updateData,
        include: {
          client: { select: { id: true, name: true, phone: true } },
          technician: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.orderStatusLog.create({
        data: {
          fromStatus,
          toStatus: status,
          message: message ?? null,
          orderId: id,
          changedById,
        },
      }),
    ]);

    // If delivered, update client totalSpent and recalculate tag
    if (status === "ENTREGADO") {
      const client = await prisma.client.findUnique({
        where: { id: order.clientId },
        select: { visitCount: true, totalSpent: true },
      });

      if (client) {
        const newTotal = client.totalSpent + (order.agreedPrice ?? 0);
        const visits = client.visitCount;

        let tag: "NEW" | "RECURRING" | "FREQUENT" | "VIP" = "NEW";
        if (visits >= 5 || newTotal >= 50000) tag = "VIP";
        else if (visits >= 3) tag = "FREQUENT";
        else if (visits >= 2) tag = "RECURRING";

        await prisma.client.update({
          where: { id: order.clientId },
          data: {
            totalSpent: newTotal,
            tag,
          },
        });
      }
    }

    // WhatsApp placeholder
    if (order.client?.phone) {
      const statusLabels: Record<string, string> = {
        RECIBIDO: "Recibido",
        EN_REVISION: "En revisión",
        ESPERANDO_REPUESTO: "Esperando repuesto",
        EN_REPARACION: "En reparación",
        LISTO_PARA_RETIRAR: "Listo para retirar",
        ENTREGADO: "Entregado",
        SIN_REPARACION: "Sin reparación",
      };
      const slug = order.store.settings?.slug;
      const trackingUrl = slug ? `${process.env.NEXT_PUBLIC_APP_URL}/${slug}` : undefined;
      const msg = buildStatusChangeMessage(
        order.store.name,
        order.orderCode,
        statusLabels[status] ?? status,
        trackingUrl
      );
      await sendWhatsAppMessage({ phone: order.client.phone, message: msg });
    }

    return NextResponse.json(updatedOrder);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
