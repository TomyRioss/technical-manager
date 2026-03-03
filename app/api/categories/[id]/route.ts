import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkReadOnly } from "@/lib/plan-guard";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const category = await (prisma as any).category.findFirst({
      where: { id, isActive: true },
    });

    if (!category) {
      return NextResponse.json({ error: "Categoria no encontrada" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error: unknown) {
    console.error("GET /api/categories/[id] error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al obtener la categoria" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
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
  } catch (error: unknown) {
    console.error("PUT /api/categories/[id] error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al actualizar la categoria" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
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
  } catch (error: unknown) {
    console.error("DELETE /api/categories/[id] error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al eliminar la categoria" }, { status: 500 });
  }
}
