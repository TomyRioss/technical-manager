import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage, buildReceiptMessage } from "@/lib/whatsapp";
import { checkReadOnly } from "@/lib/plan-guard";

export async function GET(req: NextRequest) {
  try {
    const storeId = req.nextUrl.searchParams.get("storeId");
    if (!storeId) {
      return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
    }

    const branchId = req.nextUrl.searchParams.get("branchId");
    const status = req.nextUrl.searchParams.get("status");
    const technicianId = req.nextUrl.searchParams.get("technicianId");

    const where: Record<string, unknown> = { storeId, isActive: true };
    if (branchId && branchId !== "null" && branchId !== "undefined") where.branchId = branchId;
    if (status) where.status = status;
    if (technicianId) where.technicianId = technicianId;

    const orders = await prisma.workOrder.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, phone: true } },
        technician: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error: unknown) {
    console.error("GET /api/work-orders error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al obtener órdenes de trabajo" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      deviceModel,
      reportedFault,
      faultTags,
      agreedPrice,
      clientId,
      technicianId,
      createdById,
      storeId,
      branchId,
      internalNotes,
      warrantyDays,
      partsCost,
    } = body;

    if (!deviceModel || !reportedFault || !clientId || !createdById || !storeId || !branchId) {
      return NextResponse.json(
        { error: "Campos requeridos faltantes" },
        { status: 400 }
      );
    }

    const guard = await checkReadOnly(storeId);
    if (guard) return guard;

    // Generate order code: OT-YYYYMMDD-XXX
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await prisma.workOrder.count({
      where: {
        branchId,
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        },
      },
    });
    const orderCode = `OT-${dateStr}-${String(count + 1).padStart(3, "0")}`;

    const order = await prisma.workOrder.create({
      data: {
        orderCode,
        deviceModel,
        reportedFault,
        faultTags: faultTags ?? [],
        agreedPrice: agreedPrice ?? null,
        clientId,
        technicianId: technicianId ?? null,
        createdById,
        storeId,
        branchId,
        internalNotes: internalNotes ?? null,
        warrantyDays: warrantyDays ?? null,
        partsCost: partsCost ?? 0,
      },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        technician: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    // Increment client visit count
    await prisma.client.update({
      where: { id: clientId },
      data: { visitCount: { increment: 1 } },
    });

    // WhatsApp receipt placeholder
    if (order.client?.phone) {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { name: true, settings: { select: { slug: true } } },
      });
      const slug = store?.settings?.slug;
      const trackingUrl = slug ? `${process.env.NEXT_PUBLIC_APP_URL}/${slug}` : undefined;
      const msg = buildReceiptMessage(
        store?.name ?? "",
        order.orderCode,
        order.deviceModel,
        trackingUrl
      );
      await sendWhatsAppMessage({ phone: order.client.phone, message: msg });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/work-orders error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe una orden con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al crear orden de trabajo" }, { status: 500 });
  }
}
