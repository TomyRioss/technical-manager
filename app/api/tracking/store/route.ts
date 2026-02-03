import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "slug es requerido" }, { status: 400 });
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

    return NextResponse.json({
      store: {
        name: settings.store.name,
        logoUrl: settings.logoUrl,
        primaryColor: settings.primaryColor,
        welcomeMessage: settings.welcomeMessage,
        googleMapsUrl: settings.googleMapsUrl,
      },
      featuredProducts,
    });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
