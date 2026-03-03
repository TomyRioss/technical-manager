import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlanBranchLimit } from "@/lib/store-plans";

export async function GET(req: NextRequest) {
  try {
    const storeId = req.nextUrl.searchParams.get("storeId");
    if (!storeId) {
      return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
    }

    const branches = await prisma.branch.findMany({
      where: { storeId, isActive: true },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });

    // Fill default branch NULL fields with store_settings data
    const defaultBranch = branches.find((b) => b.isDefault);
    if (defaultBranch) {
      const storeSettings = await prisma.storeSettings.findUnique({
        where: { storeId },
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

      if (storeSettings) {
        defaultBranch.whatsappNumber ??= storeSettings.whatsappNumber;
        defaultBranch.googleMapsUrl ??= storeSettings.googleMapsUrl;
        defaultBranch.businessHours ??= storeSettings.businessHours;
        defaultBranch.mapLatitude ??= storeSettings.mapLatitude;
        defaultBranch.mapLongitude ??= storeSettings.mapLongitude;
        defaultBranch.facebookUrl ??= storeSettings.facebookUrl;
        defaultBranch.instagramUrl ??= storeSettings.instagramUrl;
        defaultBranch.tiktokUrl ??= storeSettings.tiktokUrl;
        defaultBranch.twitterUrl ??= storeSettings.twitterUrl;
        defaultBranch.youtubeUrl ??= storeSettings.youtubeUrl;
        defaultBranch.address ??= storeSettings.storeAddress;
      }
    }

    return NextResponse.json(branches);
  } catch (error) {
    console.error("GET /api/branches error:", error);
    return NextResponse.json({ error: "Error al obtener sucursales" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, address, phone, storeId, userId,
      googleMapsUrl, whatsappNumber, businessHours,
      mapLatitude, mapLongitude,
      facebookUrl, instagramUrl, tiktokUrl, twitterUrl, youtubeUrl,
      phoneBranchRef, socialBranchRef, hoursBranchRef,
    } = body;

    if (!name || !storeId) {
      return NextResponse.json({ error: "Nombre y storeId son requeridos" }, { status: 400 });
    }

    // Verify user is OWNER
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (!user || user.role !== "OWNER") {
        return NextResponse.json({ error: "Solo el propietario puede crear sucursales" }, { status: 403 });
      }
    }

    // Check plan allows multi-location
    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { plan: true } });
    if (!store) {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
    }

    const existingCount = await prisma.branch.count({ where: { storeId, isActive: true } });
    const branchLimit = getPlanBranchLimit(store.plan);
    if (existingCount >= branchLimit) {
      return NextResponse.json(
        { error: `Tu plan permite hasta ${branchLimit} sucursal${branchLimit > 1 ? "es" : ""}. Actualizá tu plan para agregar más.` },
        { status: 403 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // Get store slug for unique branch slug
    const settings = await prisma.storeSettings.findUnique({
      where: { storeId },
      select: { slug: true },
    });
    const branchSlug = settings?.slug ? `${settings.slug}-${slug}` : `${storeId.slice(0, 8)}-${slug}`;

    const branch = await prisma.branch.create({
      data: {
        name,
        slug: branchSlug,
        address: address || null,
        phone: phone || null,
        storeId,
        googleMapsUrl: googleMapsUrl || null,
        whatsappNumber: whatsappNumber || null,
        businessHours: businessHours || null,
        mapLatitude: mapLatitude ?? null,
        mapLongitude: mapLongitude ?? null,
        facebookUrl: facebookUrl || null,
        instagramUrl: instagramUrl || null,
        tiktokUrl: tiktokUrl || null,
        twitterUrl: twitterUrl || null,
        youtubeUrl: youtubeUrl || null,
        phoneBranchRef: phoneBranchRef || null,
        socialBranchRef: socialBranchRef || null,
        hoursBranchRef: hoursBranchRef || null,
      },
    });

    return NextResponse.json(branch, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/branches error:", error);
    const prismaError = error && typeof error === "object" && "code" in error ? (error as { code: string }) : null;
    if (prismaError) {
      if (prismaError.code === "P2002") {
        return NextResponse.json({ error: "Ya existe una sucursal con ese nombre" }, { status: 409 });
      }
      if (prismaError.code === "P2000") {
        return NextResponse.json({ error: "Uno de los valores ingresados es demasiado largo" }, { status: 400 });
      }
      if (prismaError.code === "P2025") {
        return NextResponse.json({ error: "Registro relacionado no encontrado" }, { status: 404 });
      }
    }
    return NextResponse.json({ error: "Error al crear sucursal" }, { status: 500 });
  }
}
