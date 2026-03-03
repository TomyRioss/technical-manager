import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkReadOnly } from "@/lib/plan-guard";

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("storeId");
  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!storeId) {
    return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
  }

  try {
    const where: Record<string, unknown> = {
      storeId,
      isDeleted: false,
      OR: [
        { isActive: true },
        {
          isActive: false,
          OR: [
            { salePrice: { lte: 0 } },
            { costPrice: null },
          ],
        },
      ],
    };
    if (branchId && branchId !== "null" && branchId !== "undefined") where.branchId = branchId;

    const items = await prisma.item.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: { select: { id: true, name: true } } } as any,
    });

    return NextResponse.json(items);
  } catch (error: unknown) {
    console.error("GET /api/items error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al obtener los productos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, sku, costPrice, salePrice, stock, isActive, storeId, branchId, categoryId } = body;

  if (!name || !storeId || !branchId) {
    return NextResponse.json({ error: "name, storeId y branchId requeridos" }, { status: 400 });
  }

  const guard = await checkReadOnly(storeId);
  if (guard) return guard;

  try {
    const item = await prisma.item.create({
      data: {
        name,
        description: description || null,
        sku: sku || "",
        costPrice: costPrice || null,
        salePrice: salePrice || 0,
        stock: stock || 0,
        isActive: isActive ?? true,
        storeId,
        branchId,
        categoryId: categoryId || null,
      } as any,
      include: { category: { select: { id: true, name: true } } } as any,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/items error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al crear el producto" }, { status: 500 });
  }
}
