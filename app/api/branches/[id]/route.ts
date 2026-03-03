import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CONFIG_FIELDS = [
  "googleMapsUrl", "whatsappNumber", "businessHours",
  "mapLatitude", "mapLongitude",
  "facebookUrl", "instagramUrl", "tiktokUrl", "twitterUrl", "youtubeUrl",
  "phoneBranchRef", "socialBranchRef", "hoursBranchRef",
] as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const branch = await prisma.branch.findUnique({ where: { id } });
    if (!branch) {
      return NextResponse.json({ error: "Sucursal no encontrada" }, { status: 404 });
    }

    // If default branch, backfill NULLs from StoreSettings
    if (branch.isDefault) {
      const ss = await prisma.storeSettings.findUnique({
        where: { storeId: branch.storeId },
        select: {
          whatsappNumber: true,
          googleMapsUrl: true,
          businessHours: true,
          mapLatitude: true,
          mapLongitude: true,
          facebookUrl: true,
          instagramUrl: true,
          tiktokUrl: true,
          twitterUrl: true,
          youtubeUrl: true,
          storeAddress: true,
        },
      });
      if (ss) {
        branch.whatsappNumber ??= ss.whatsappNumber;
        branch.googleMapsUrl ??= ss.googleMapsUrl;
        branch.businessHours ??= ss.businessHours;
        branch.mapLatitude ??= ss.mapLatitude;
        branch.mapLongitude ??= ss.mapLongitude;
        branch.facebookUrl ??= ss.facebookUrl;
        branch.instagramUrl ??= ss.instagramUrl;
        branch.tiktokUrl ??= ss.tiktokUrl;
        branch.twitterUrl ??= ss.twitterUrl;
        branch.youtubeUrl ??= ss.youtubeUrl;
        branch.address ??= ss.storeAddress;
      }
    }

    return NextResponse.json(branch);
  } catch (error) {
    console.error("GET /api/branches/[id] error:", error);
    return NextResponse.json({ error: "Error al obtener sucursal" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, address, phone, userId } = body;

    // Verify user is OWNER
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (!user || user.role !== "OWNER") {
        return NextResponse.json({ error: "Solo el propietario puede editar sucursales" }, { status: 403 });
      }
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (address !== undefined) data.address = address;
    if (phone !== undefined) data.phone = phone;

    // Handle all config fields
    for (const field of CONFIG_FIELDS) {
      if (body[field] !== undefined) {
        data[field] = body[field] === "" ? null : body[field];
      }
    }

    // If name changed, update slug
    if (name) {
      const branch = await prisma.branch.findUnique({ where: { id }, select: { storeId: true } });
      if (branch) {
        const settings = await prisma.storeSettings.findUnique({
          where: { storeId: branch.storeId },
          select: { slug: true },
        });
        const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        data.slug = settings?.slug ? `${settings.slug}-${slug}` : slug;
      }
    }

    const updated = await prisma.branch.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("PUT /api/branches/[id] error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe una sucursal con ese nombre" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Sucursal no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al actualizar sucursal" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("userId");

    // Verify user is OWNER
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (!user || user.role !== "OWNER") {
        return NextResponse.json({ error: "Solo el propietario puede eliminar sucursales" }, { status: 403 });
      }
    }

    // Cannot delete default branch
    const branch = await prisma.branch.findUnique({ where: { id }, select: { isDefault: true } });
    if (!branch) {
      return NextResponse.json({ error: "Sucursal no encontrada" }, { status: 404 });
    }
    if (branch.isDefault) {
      return NextResponse.json({ error: "No se puede eliminar la sucursal principal" }, { status: 400 });
    }

    // Soft delete
    await prisma.branch.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/branches/[id] error:", error);
    return NextResponse.json({ error: "Error al eliminar sucursal" }, { status: 500 });
  }
}
