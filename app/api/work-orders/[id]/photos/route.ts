import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkReadOnly } from "@/lib/plan-guard";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const photos = await prisma.orderPhoto.findMany({
      where: { orderId: id },
      orderBy: { takenAt: "desc" },
    });

    return NextResponse.json(photos);
  } catch (error: unknown) {
    console.error("GET /api/work-orders/[id]/photos error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al obtener fotos de la orden" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { url, caption } = body;

    if (!url) {
      return NextResponse.json({ error: "URL requerida" }, { status: 400 });
    }

    const existingOrder = await prisma.workOrder.findUnique({ where: { id }, select: { storeId: true } });
    if (existingOrder) {
      const guard = await checkReadOnly(existingOrder.storeId);
      if (guard) return guard;
    }

    const photo = await prisma.orderPhoto.create({
      data: {
        url,
        caption: caption ?? null,
        orderId: id,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/work-orders/[id]/photos error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al guardar foto de la orden" }, { status: 500 });
  }
}
