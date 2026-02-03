import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const storeId = req.nextUrl.searchParams.get("storeId");
    if (!storeId) {
      return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
    }

    const clients = await prisma.client.findMany({
      where: { storeId, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clients);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, notes, storeId } = body;

    if (!name || !storeId) {
      return NextResponse.json(
        { error: "Nombre y storeId son requeridos" },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: { name, phone, email, notes, storeId },
    });

    return NextResponse.json(client, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
