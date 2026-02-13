import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkReadOnly } from "@/lib/plan-guard";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const category = await (prisma as any).category.findFirst({
    where: { id, isActive: true },
  });

  if (!category) {
    return NextResponse.json({ error: "Categoria no encontrada" }, { status: 404 });
  }

  return NextResponse.json(category);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await (prisma as any).category.findUnique({ where: { id }, select: { storeId: true } });
  if (existing) {
    const guard = await checkReadOnly(existing.storeId);
    if (guard) return guard;
  }

  const body = await req.json();
  const { name } = body;

  const category = await (prisma as any).category.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.toUpperCase() }),
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await (prisma as any).category.findUnique({ where: { id }, select: { storeId: true } });
  if (existing) {
    const guard = await checkReadOnly(existing.storeId);
    if (guard) return guard;
  }

  await (prisma as any).category.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
