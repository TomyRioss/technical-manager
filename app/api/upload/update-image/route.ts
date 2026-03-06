import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { itemId, url } = await req.json();

    if (!itemId || !url) {
      return NextResponse.json({ error: "Faltan parámetros itemId o url" }, { status: 400 });
    }

    await prisma.item.update({
      where: { id: itemId },
      data: { imageUrl: url },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/upload/update-image error:", error);
    return NextResponse.json({ error: "Error al actualizar la imagen del producto" }, { status: 500 });
  }
}
