import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const store = await prisma.store.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        plan: true,
        planExpiresAt: true,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Lazy downgrade: DEMO expired → FREE
    if ((store.plan as string) === "DEMO" && store.planExpiresAt && new Date(store.planExpiresAt) < new Date()) {
      await prisma.store.update({
        where: { id },
        data: { plan: "FREE", planExpiresAt: null },
      });
      return NextResponse.json({ ...store, plan: "FREE", planExpiresAt: null });
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error("Error fetching store:", error);
    return NextResponse.json({ error: "Error al obtener tienda. Intentá de nuevo." }, { status: 500 });
  }
}
