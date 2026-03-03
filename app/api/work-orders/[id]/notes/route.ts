import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkReadOnly } from "@/lib/plan-guard";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const notes = await prisma.orderNote.findMany({
      where: { orderId: id },
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notes);
  } catch (error: unknown) {
    console.error("GET /api/work-orders/[id]/notes error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al obtener notas de la orden" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { content, type, authorId } = body;

    if (!content || !authorId) {
      return NextResponse.json(
        { error: "content y authorId son requeridos" },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.workOrder.findUnique({ where: { id }, select: { storeId: true } });
    if (existingOrder) {
      const guard = await checkReadOnly(existingOrder.storeId);
      if (guard) return guard;
    }

    const note = await prisma.orderNote.create({
      data: {
        content,
        type: type ?? "INTERNAL",
        orderId: id,
        authorId,
      },
      include: { author: { select: { id: true, name: true } } },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/work-orders/[id]/notes error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al crear nota en la orden" }, { status: 500 });
  }
}
