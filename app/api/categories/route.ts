import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkReadOnly } from "@/lib/plan-guard";

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("storeId");
  if (!storeId) {
    return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
  }

  try {
    const categories = await (prisma as any).category.findMany({
      where: { storeId, isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error: unknown) {
    console.error("GET /api/categories error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al obtener las categorias" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, storeId } = body;

  if (!name || !storeId) {
    return NextResponse.json({ error: "name y storeId requeridos" }, { status: 400 });
  }

  const guard = await checkReadOnly(storeId);
  if (guard) return guard;

  try {
    const existing = await (prisma as any).category.findFirst({
      where: { storeId, name: name.toUpperCase(), isActive: true },
    });

    if (existing) {
      return NextResponse.json({ error: "Ya existe una categoria con ese nombre" }, { status: 400 });
    }

    const category = await (prisma as any).category.create({
      data: {
        name: name.toUpperCase(),
        storeId,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/categories error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al crear la categoria" }, { status: 500 });
  }
}
