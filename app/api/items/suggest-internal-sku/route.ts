import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { storeId, name } = await req.json();
    if (!storeId || !name) {
      return NextResponse.json({ error: "storeId y name requeridos" }, { status: 400 });
    }

    const prefix = name
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 3)
      .toUpperCase();

    if (prefix.length < 1) {
      return NextResponse.json({ error: "El nombre no contiene letras válidas" }, { status: 400 });
    }

    const existing = await (prisma.item as any).findMany({
      where: {
        storeId,
        isDeleted: false,
        internalSku: { startsWith: prefix },
      },
      select: { internalSku: true },
    });

    let max = 0;
    for (const item of existing) {
      const numPart = parseInt((item.internalSku as string).slice(prefix.length), 10);
      if (!isNaN(numPart) && numPart > max) max = numPart;
    }

    const next = String(max + 1).padStart(3, "0");
    return NextResponse.json({ internalSku: `${prefix}${next}` });
  } catch (error) {
    console.error("POST /api/items/suggest-internal-sku error:", error);
    return NextResponse.json({ error: "Error al generar SKU interno" }, { status: 500 });
  }
}
