import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_DEVICE_CATALOG } from "@/lib/device-catalog";

async function seedGlobalCatalog() {
  const count = await prisma.deviceBrand.count({ where: { isGlobal: true } });
  if (count > 0) return;

  for (const [brandName, models] of Object.entries(DEFAULT_DEVICE_CATALOG)) {
    const brand = await prisma.deviceBrand.create({
      data: {
        name: brandName,
        isGlobal: true,
        storeId: null,
      },
    });

    if (models.length > 0) {
      await prisma.deviceModel.createMany({
        data: models.map((name) => ({
          name,
          brandId: brand.id,
        })),
      });
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const storeId = req.nextUrl.searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
    }

    await seedGlobalCatalog();

    const brands = await prisma.deviceBrand.findMany({
      where: {
        isActive: true,
        OR: [
          { isGlobal: true },
          { storeId },
        ],
      },
      include: {
        models: {
          where: { isActive: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(brands);
  } catch (err) {
    console.error("GET /api/devices error:", err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeId, name } = body;

    if (!storeId || !name?.trim()) {
      return NextResponse.json({ error: "storeId y name requeridos" }, { status: 400 });
    }

    const brand = await prisma.deviceBrand.create({
      data: {
        name: name.trim(),
        isGlobal: false,
        storeId,
      },
    });

    return NextResponse.json(brand);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
