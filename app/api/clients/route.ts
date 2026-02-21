import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkReadOnly } from "@/lib/plan-guard";

export async function GET(req: NextRequest) {
  try {
    const storeId = req.nextUrl.searchParams.get("storeId");
    const branchId = req.nextUrl.searchParams.get("branchId");
    if (!storeId) {
      return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
    }

    const where: Record<string, unknown> = { storeId, isActive: true };
    if (branchId) where.branchId = branchId;

    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clients);
  } catch (error: unknown) {
    console.error("GET /api/clients error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, notes, storeId, branchId } = body;

    if (!name || !storeId || !branchId) {
      return NextResponse.json(
        { error: "Nombre, storeId y branchId son requeridos" },
        { status: 400 }
      );
    }

    const guard = await checkReadOnly(storeId);
    if (guard) return guard;

    const client = await prisma.client.create({
      data: { name, phone, email, notes, storeId, branchId },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/clients error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un cliente con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 });
  }
}
