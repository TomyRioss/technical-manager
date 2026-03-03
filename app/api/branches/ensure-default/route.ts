import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { storeId, userId } = await req.json();

    if (!storeId || !userId) {
      return NextResponse.json(
        { error: "storeId y userId son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el user sea OWNER
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, storeId: true },
    });

    if (!user || user.storeId !== storeId || user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Solo el dueño de la tienda puede crear la sucursal por defecto" },
        { status: 403 }
      );
    }

    // Chequear si ya tiene branches
    const existingBranches = await prisma.branch.findMany({
      where: { storeId, isActive: true },
      take: 1,
    });

    if (existingBranches.length > 0) {
      return NextResponse.json({ existed: true });
    }

    // Obtener slug de StoreSettings
    const settings = await prisma.storeSettings.findUnique({
      where: { storeId },
      select: { slug: true },
    });

    const slug = settings?.slug || "tienda";

    // Crear "Sucursal Principal" (replica lógica de register)
    const branch = await prisma.branch.create({
      data: {
        name: "Sucursal Principal",
        slug: `${slug}-sucursal-principal`,
        isDefault: true,
        storeId,
      },
    });

    // Crear UserBranch para el OWNER
    await prisma.userBranch.create({
      data: { userId, branchId: branch.id },
    });

    return NextResponse.json({ created: true, branch });
  } catch (error: unknown) {
    console.error("POST /api/branches/ensure-default error:", error);

    // Race condition: otra request ya creó la branch
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ existed: true });
    }

    return NextResponse.json(
      { error: "Error al crear sucursal por defecto" },
      { status: 500 }
    );
  }
}
