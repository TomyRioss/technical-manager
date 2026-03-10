import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("storeId");
  if (!storeId) {
    return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
  }

  try {
    const suppliers = await prisma.supplier.findMany({
      where: { storeId, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("GET /api/suppliers error:", error);
    return NextResponse.json({ error: "Error al obtener proveedores" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, storeId } = body;

  if (!name?.trim() || !storeId) {
    return NextResponse.json({ error: "name y storeId requeridos" }, { status: 400 });
  }

  try {
    const supplier = await prisma.supplier.create({
      data: { name: name.trim(), storeId },
      select: { id: true, name: true },
    });
    return NextResponse.json(supplier, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/suppliers error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un proveedor con ese nombre" }, { status: 409 });
    }
    return NextResponse.json({ error: "Error al crear el proveedor" }, { status: 500 });
  }
}
