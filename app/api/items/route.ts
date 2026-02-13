import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkReadOnly } from "@/lib/plan-guard";

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("storeId");
  if (!storeId) {
    return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
  }

  const items = await prisma.item.findMany({
    where: {
      storeId,
      isDeleted: false,
      OR: [
        { isActive: true },
        {
          isActive: false,
          OR: [
            { salePrice: { lte: 0 } },
            { costPrice: null },
          ],
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { category: { select: { id: true, name: true } } } as any,
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, sku, costPrice, salePrice, stock, isActive, storeId, categoryId } = body;

  if (!name || !storeId) {
    return NextResponse.json({ error: "name y storeId requeridos" }, { status: 400 });
  }

  const guard = await checkReadOnly(storeId);
  if (guard) return guard;

  const item = await prisma.item.create({
    data: {
      name,
      sku: sku || "",
      costPrice: costPrice || null,
      salePrice: salePrice || 0,
      stock: stock || 0,
      isActive: isActive ?? true,
      storeId,
      categoryId: categoryId || null,
    } as any,
    include: { category: { select: { id: true, name: true } } } as any,
  });

  return NextResponse.json(item, { status: 201 });
}
