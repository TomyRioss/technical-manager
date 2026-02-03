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
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
