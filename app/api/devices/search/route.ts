import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const storeId = req.nextUrl.searchParams.get("storeId");
    const q = req.nextUrl.searchParams.get("q");

    if (!storeId || !q || q.length < 2) {
      return NextResponse.json([]);
    }

    const models = await prisma.deviceModel.findMany({
      where: {
        isActive: true,
        brand: {
          isActive: true,
          OR: [
            { isGlobal: true },
            { storeId },
          ],
        },
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { brand: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: {
        brand: { select: { id: true, name: true } },
      },
      take: 20,
      orderBy: { name: "asc" },
    });

    const results = models.map((m) => ({
      brandId: m.brand.id,
      brandName: m.brand.name,
      modelId: m.id,
      modelName: m.name,
      displayName: `${m.brand.name} ${m.name}`,
    }));

    return NextResponse.json(results);
  } catch (error: unknown) {
    console.error("GET /api/devices/search error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al buscar dispositivos" }, { status: 500 });
  }
}
