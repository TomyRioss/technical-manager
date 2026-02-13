import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkReadOnly } from "@/lib/plan-guard";

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("storeId");
  if (!storeId) {
    return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
  }

  const categories = await (prisma as any).category.findMany({
    where: { storeId, isActive: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, storeId } = body;

  if (!name || !storeId) {
    return NextResponse.json({ error: "name y storeId requeridos" }, { status: 400 });
  }

  const guard = await checkReadOnly(storeId);
  if (guard) return guard;

  const existing = await (prisma as any).category.findFirst({
    where: { storeId, name: name.toUpperCase(), isActive: true },
  });

  if (existing) {
    return NextResponse.json({ error: "Ya existe una categoria con ese nombre" }, { status: 400 });
  }

  const category = await (prisma as any).category.create({
    data: {
      name: name.toUpperCase(),
      storeId,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
