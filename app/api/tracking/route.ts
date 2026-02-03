import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug");
    const orderCode = req.nextUrl.searchParams.get("orderCode");

    if (!slug || !orderCode) {
      return NextResponse.json(
        { error: "slug y orderCode son requeridos" },
        { status: 400 }
      );
    }

    const settings = await prisma.storeSettings.findUnique({
      where: { slug },
      include: { store: { select: { id: true, name: true } } },
    });

    if (!settings) {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
    }

    const featuredProducts = await prisma.item.findMany({
      where: {
        storeId: settings.storeId,
        isActive: true,
        stock: { gt: 0 },
        imageUrl: { not: null },
      },
      select: {
        id: true,
        name: true,
        salePrice: true,
        imageUrl: true,
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    });

    const order = await prisma.workOrder.findFirst({
      where: {
        storeId: settings.storeId,
        orderCode: orderCode.toUpperCase(),
        isActive: true,
      },
      select: {
        id: true,
        orderCode: true,
        deviceModel: true,
        status: true,
        technicianMessage: true,
        warrantyDays: true,
        warrantyExpires: true,
        warrantyStatus: true,
        createdAt: true,
        updatedAt: true,
        photos: {
          select: { url: true, caption: true, takenAt: true },
          orderBy: { takenAt: "desc" },
        },
        statusLogs: {
          select: { fromStatus: true, toStatus: true, message: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        },
        rating: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      store: {
        name: settings.store.name,
        logoUrl: settings.logoUrl,
        primaryColor: settings.primaryColor,
        welcomeMessage: settings.welcomeMessage,
        googleMapsUrl: settings.googleMapsUrl,
      },
      order,
      featuredProducts,
    });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
