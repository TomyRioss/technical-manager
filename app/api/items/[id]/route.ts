import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkReadOnly } from "@/lib/plan-guard";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await prisma.item.findFirst({
    where: { id, isActive: true },
    include: { category: { select: { id: true, name: true } } } as any,
  });
  if (!item) {
    return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await prisma.item.findUnique({ where: { id }, select: { storeId: true } });
  if (existing) {
    const guard = await checkReadOnly(existing.storeId);
    if (guard) return guard;
  }

  const body = await req.json();
  const { name, sku, costPrice, salePrice, stock, isActive, categoryId } = body;

  const item = await prisma.item.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(sku !== undefined && { sku }),
      ...(costPrice !== undefined && { costPrice: costPrice || null }),
      ...(salePrice !== undefined && { salePrice }),
      ...(stock !== undefined && { stock }),
      ...(isActive !== undefined && { isActive }),
      ...(categoryId !== undefined && { categoryId: categoryId || null }),
    } as any,
    include: { category: { select: { id: true, name: true } } } as any,
  });

  return NextResponse.json(item);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await prisma.item.findUnique({ where: { id }, select: { storeId: true } });
  if (existing) {
    const guard = await checkReadOnly(existing.storeId);
    if (guard) return guard;
  }

  await prisma.item.update({ where: { id }, data: { isDeleted: true } });
  return NextResponse.json({ ok: true });
}
