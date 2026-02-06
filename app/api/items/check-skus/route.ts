import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, skus } = body as { storeId: string; skus: string[] };

    if (!storeId || !skus || skus.length === 0) {
      return NextResponse.json({ activeDuplicates: [] });
    }

    const existingItems = await prisma.item.findMany({
      where: {
        storeId,
        sku: { in: skus },
        isActive: true,
        isDeleted: false,
      },
      select: { sku: true },
    });

    const activeDuplicates = existingItems.map((item: { sku: string }) => item.sku);

    return NextResponse.json({ activeDuplicates });
  } catch (error) {
    console.error("Error checking SKUs:", error);
    return NextResponse.json({ activeDuplicates: [] });
  }
}
