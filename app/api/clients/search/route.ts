import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const storeId = req.nextUrl.searchParams.get("storeId");
    const branchId = req.nextUrl.searchParams.get("branchId");
    const q = req.nextUrl.searchParams.get("q");

    if (!storeId) {
      return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
    }

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const where: Record<string, unknown> = {
      storeId,
      isActive: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    };
    if (branchId) where.branchId = branchId;

    const clients = await prisma.client.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        tag: true,
      },
      take: 10,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(clients);
  } catch (error: unknown) {
    console.error("GET /api/clients/search error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al buscar clientes" }, { status: 500 });
  }
}
