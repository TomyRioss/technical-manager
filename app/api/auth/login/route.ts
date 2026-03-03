import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { store: true },
    });

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Usuario desactivado" },
        { status: 403 }
      );
    }

    // Get user branches
    let branches;
    if (user.role === "OWNER") {
      branches = await prisma.branch.findMany({
        where: { storeId: user.storeId, isActive: true },
        orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      });
    } else {
      const userBranches = await prisma.userBranch.findMany({
        where: { userId: user.id },
        include: { branch: true },
      });
      branches = userBranches
        .map((ub) => ub.branch)
        .filter((b) => b.isActive);
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
        storeId: user.storeId,
        storeName: user.store.name,
        branches,
      },
    });
  } catch (error: unknown) {
    console.error("POST /api/auth/login error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}
