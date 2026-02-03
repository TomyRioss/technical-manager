import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const { url, caption } = body;

    if (!url) {
      return NextResponse.json({ error: "URL requerida" }, { status: 400 });
    }

    const photo = await prisma.orderPhoto.create({
      data: {
        url,
        caption: caption ?? null,
        orderId: id,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
