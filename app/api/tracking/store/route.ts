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

    // Get branch slug or default branch for featured products
    const branchSlug = req.nextUrl.searchParams.get("branchSlug");
    const featuredWhere: Record<string, unknown> = {
      storeId: settings.storeId,
      isActive: true,
      stock: { gt: 0 },
      imageUrl: { not: null },
    };

    if (branchSlug) {
      const branch = await prisma.branch.findUnique({ where: { slug: branchSlug } });
      if (branch) featuredWhere.branchId = branch.id;
    } else {
      const defaultBranch = await prisma.branch.findFirst({
        where: { storeId: settings.storeId, isDefault: true, isActive: true },
      });
      if (defaultBranch) featuredWhere.branchId = defaultBranch.id;
    }

    const featuredProducts = await prisma.item.findMany({
      where: featuredWhere,
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
  } catch (error: unknown) {
    console.error("GET /api/tracking/store error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al obtener datos de la tienda" }, { status: 500 });
  }
}
