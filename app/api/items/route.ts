import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("storeId");
  if (!storeId) {
    return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
  }

  const items = await prisma.item.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, sku, salePrice, stock, isActive, storeId } = body;

  if (!name || !storeId) {
    return NextResponse.json({ error: "name y storeId requeridos" }, { status: 400 });
  }

  const item = await prisma.item.create({
    data: {
      name,
      sku: sku || "",
      salePrice: salePrice || 0,
      stock: stock || 0,
      isActive: isActive ?? true,
      storeId,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
