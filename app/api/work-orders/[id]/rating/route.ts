import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rating = await prisma.orderRating.findUnique({
      where: { orderId: id },
    });

    return NextResponse.json(rating);
  } catch (error: unknown) {
    console.error("GET /api/work-orders/[id]/rating error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al obtener calificación" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { stars, feedback } = body;

    if (!stars || stars < 1 || stars > 5) {
      return NextResponse.json(
        { error: "stars debe ser entre 1 y 5" },
        { status: 400 }
      );
    }

    // Check if already rated
    const existing = await prisma.orderRating.findUnique({
      where: { orderId: id },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Esta orden ya fue valorada" },
        { status: 409 }
      );
    }

    const rating = await prisma.orderRating.create({
      data: {
        stars,
        feedback: feedback?.trim() || null,
        orderId: id,
      },
    });

    return NextResponse.json(rating, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/work-orders/[id]/rating error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al guardar calificación" }, { status: 500 });
  }
}
