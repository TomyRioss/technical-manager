import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, branchId, skus } = body as { storeId: string; branchId?: string; skus: string[] };

    if (!storeId || !skus || skus.length === 0) {
      return NextResponse.json({ activeDuplicates: [] });
    }

    const where: Record<string, unknown> = {
      storeId,
      sku: { in: skus },
      isActive: true,
      isDeleted: false,
    };
    if (branchId && branchId !== "null" && branchId !== "undefined") where.branchId = branchId;

    const existingItems = await prisma.item.findMany({
      where,
      select: { sku: true },
    });

    const activeDuplicates = existingItems.map((item: { sku: string }) => item.sku);

    return NextResponse.json({ activeDuplicates });
  } catch (error: unknown) {
    console.error("POST /api/items/check-skus error:", error);
    return NextResponse.json({ error: "Error al verificar SKUs duplicados" }, { status: 500 });
  }
}
