import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;
    const body = await req.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "name requerido" }, { status: 400 });
    }

    const brand = await prisma.deviceBrand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      return NextResponse.json({ error: "Marca no encontrada" }, { status: 404 });
    }

    const model = await prisma.deviceModel.create({
      data: {
        name: name.trim(),
        brandId,
      },
    });

    return NextResponse.json(model);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    await params;
    const body = await req.json();
    const { modelId, name } = body;

    if (!modelId || !name?.trim()) {
      return NextResponse.json({ error: "modelId y name requeridos" }, { status: 400 });
    }

    const model = await prisma.deviceModel.update({
      where: { id: modelId },
      data: { name: name.trim() },
    });

    return NextResponse.json(model);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    await params;
    const { searchParams } = req.nextUrl;
    const modelId = searchParams.get("modelId");

    if (!modelId) {
      return NextResponse.json({ error: "modelId requerido" }, { status: 400 });
    }

    await prisma.deviceModel.delete({
      where: { id: modelId },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
