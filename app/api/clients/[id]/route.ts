import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkReadOnly } from "@/lib/plan-guard";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await prisma.client.findFirst({
      where: { id, isActive: true },
      include: {
        workOrders: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderCode: true,
            deviceModel: true,
            status: true,
            agreedPrice: true,
            createdAt: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.client.findUnique({ where: { id }, select: { storeId: true } });
    if (existing) {
      const guard = await checkReadOnly(existing.storeId);
      if (guard) return guard;
    }

    const body = await req.json();
    const { name, phone, email, notes } = body;

    const client = await prisma.client.update({
      where: { id },
      data: { name, phone, email, notes },
    });

    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.client.findUnique({ where: { id }, select: { storeId: true } });
    if (existing) {
      const guard = await checkReadOnly(existing.storeId);
      if (guard) return guard;
    }

    await prisma.client.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
