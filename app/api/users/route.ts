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
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
