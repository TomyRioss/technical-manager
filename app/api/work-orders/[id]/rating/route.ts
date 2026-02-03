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
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
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
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
