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
  } catch (error: unknown) {
    console.error("POST /api/devices/[brandId]/models error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un modelo con ese nombre para esta marca" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al crear modelo de dispositivo" }, { status: 500 });
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
  } catch (error: unknown) {
    console.error("PUT /api/devices/[brandId]/models error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un modelo con ese nombre para esta marca" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Modelo no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al actualizar modelo de dispositivo" }, { status: 500 });
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
  } catch (error: unknown) {
    console.error("DELETE /api/devices/[brandId]/models error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Modelo no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al eliminar modelo de dispositivo" }, { status: 500 });
  }
}
