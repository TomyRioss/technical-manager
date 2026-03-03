import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const storeId = req.nextUrl.searchParams.get("storeId");
    if (!storeId) {
      return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
    }

    const users = await prisma.user.findMany({
      where: { storeId, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
        userBranches: {
          include: { branch: { select: { id: true, name: true, isDefault: true } } },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(users);
  } catch (error: unknown) {
    console.error("GET /api/users error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}
