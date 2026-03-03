import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const storeId = req.nextUrl.searchParams.get("storeId");

    if (!userId || !storeId) {
      return NextResponse.json({ error: "userId y storeId requeridos" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // OWNER sees all branches
    if (user.role === "OWNER") {
      const branches = await prisma.branch.findMany({
        where: { storeId, isActive: true },
        orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      });
      return NextResponse.json(branches);
    }

    // MANAGER and TECHNICIAN see only assigned branches
    const userBranches = await prisma.userBranch.findMany({
      where: { userId },
      include: {
        branch: true,
      },
    });

    const branches = userBranches
      .map((ub) => ub.branch)
      .filter((b) => b.storeId === storeId && b.isActive);

    return NextResponse.json(branches);
  } catch (error) {
    console.error("GET /api/branches/my-branches error:", error);
    return NextResponse.json({ error: "Error al obtener sucursales" }, { status: 500 });
  }
}
