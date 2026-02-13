import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkReadOnly } from "@/lib/plan-guard";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.workOrder.findFirst({
      where: { id, isActive: true },
      include: {
        client: { select: { id: true, name: true, phone: true, email: true, tag: true } },
        technician: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        photos: { orderBy: { takenAt: "desc" } },
        statusLogs: {
          orderBy: { createdAt: "asc" },
          include: { changedBy: { select: { id: true, name: true } } },
        },
        notes: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { id: true, name: true } } },
        },
        rating: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    return NextResponse.json(order);
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

    const existing = await prisma.workOrder.findUnique({ where: { id }, select: { storeId: true } });
    if (existing) {
      const guard = await checkReadOnly(existing.storeId);
      if (guard) return guard;
    }

    const body = await req.json();
    const { deviceModel, reportedFault, faultTags, agreedPrice, technicianId, internalNotes, warrantyDays, partsCost } = body;

    const order = await prisma.workOrder.update({
      where: { id },
      data: {
        ...(deviceModel !== undefined && { deviceModel }),
        ...(reportedFault !== undefined && { reportedFault }),
        ...(faultTags !== undefined && { faultTags }),
        ...(agreedPrice !== undefined && { agreedPrice }),
        ...(technicianId !== undefined && { technicianId }),
        ...(internalNotes !== undefined && { internalNotes }),
        ...(warrantyDays !== undefined && { warrantyDays }),
        ...(partsCost !== undefined && { partsCost }),
      },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        technician: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(order);
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

    const existing = await prisma.workOrder.findUnique({ where: { id }, select: { storeId: true } });
    if (existing) {
      const guard = await checkReadOnly(existing.storeId);
      if (guard) return guard;
    }

    await prisma.workOrder.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
