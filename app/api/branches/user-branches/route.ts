import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 });
    }

    const userBranches = await prisma.userBranch.findMany({
      where: { userId },
      include: { branch: { select: { id: true, name: true, isDefault: true } } },
    });

    return NextResponse.json(userBranches);
  } catch (error) {
    console.error("GET /api/branches/user-branches error:", error);
    return NextResponse.json({ error: "Error al obtener sucursales del usuario" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, branchIds, requesterId } = body;

    if (!userId || !branchIds || !requesterId) {
      return NextResponse.json({ error: "userId, branchIds y requesterId son requeridos" }, { status: 400 });
    }

    // Verify requester is OWNER
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { role: true },
    });
    if (!requester || requester.role !== "OWNER") {
      return NextResponse.json({ error: "Solo el propietario puede asignar sucursales" }, { status: 403 });
    }

    // Delete existing assignments
    await prisma.userBranch.deleteMany({ where: { userId } });

    // Create new assignments
    if (branchIds.length > 0) {
      await prisma.userBranch.createMany({
        data: branchIds.map((branchId: string) => ({ userId, branchId })),
      });
    }

    const updated = await prisma.userBranch.findMany({
      where: { userId },
      include: { branch: { select: { id: true, name: true, isDefault: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/branches/user-branches error:", error);
    return NextResponse.json({ error: "Error al obtener sucursales del usuario" }, { status: 500 });
  }
}
