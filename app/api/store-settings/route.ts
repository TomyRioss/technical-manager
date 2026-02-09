import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const storeId = req.nextUrl.searchParams.get("storeId");
    const slug = req.nextUrl.searchParams.get("slug");

    if (!storeId && !slug) {
      return NextResponse.json({ error: "storeId o slug requerido" }, { status: 400 });
    }

    if (slug) {
      const settings = await prisma.storeSettings.findUnique({ where: { slug } });
      if (!settings) {
        return NextResponse.json(null);
      }
      return NextResponse.json(settings);
    }

    // Si se busca por storeId, crear si no existe
    const store = await prisma.store.findUnique({ where: { id: storeId! }, select: { id: true, name: true } });
    if (!store) {
      return NextResponse.json(null);
    }

    const settings = await prisma.storeSettings.upsert({
      where: { storeId: storeId! },
      update: {},
      create: {
        storeId: storeId!,
        slug: store.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        primaryColor: "#000000",
        unretrievedDays: 7,
      },
    });

    return NextResponse.json(settings);
  } catch (err) {
    console.error("GET /api/store-settings error:", err);
    return NextResponse.json({ error: "Error al obtener configuración. Intentá de nuevo." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      storeId,
      logoUrl,
      primaryColor,
      welcomeMessage,
      messageSignature,
      slug,
      googleMapsUrl,
      whatsappNumber,
      unretrievedDays,
      storeAddress,
      businessHours,
      mapLatitude,
      mapLongitude,
      facebookUrl,
      instagramUrl,
      tiktokUrl,
      twitterUrl,
      youtubeUrl,
    } = body;

    if (!storeId) {
      return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
    }

    const settings = await prisma.storeSettings.upsert({
      where: { storeId },
      update: {
        ...(logoUrl !== undefined && { logoUrl }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(welcomeMessage !== undefined && { welcomeMessage }),
        ...(messageSignature !== undefined && { messageSignature }),
        ...(slug !== undefined && { slug }),
        ...(googleMapsUrl !== undefined && { googleMapsUrl }),
        ...(whatsappNumber !== undefined && { whatsappNumber }),
        ...(unretrievedDays !== undefined && { unretrievedDays }),
        ...(storeAddress !== undefined && { storeAddress }),
        ...(businessHours !== undefined && { businessHours }),
        ...(mapLatitude !== undefined && { mapLatitude }),
        ...(mapLongitude !== undefined && { mapLongitude }),
        ...(facebookUrl !== undefined && { facebookUrl }),
        ...(instagramUrl !== undefined && { instagramUrl }),
        ...(tiktokUrl !== undefined && { tiktokUrl }),
        ...(twitterUrl !== undefined && { twitterUrl }),
        ...(youtubeUrl !== undefined && { youtubeUrl }),
      } as Parameters<typeof prisma.storeSettings.upsert>[0]["update"],
      create: {
        storeId,
        slug: slug || storeId,
        logoUrl,
        primaryColor: primaryColor ?? "#000000",
        welcomeMessage,
        messageSignature,
        googleMapsUrl,
        whatsappNumber,
        unretrievedDays: unretrievedDays ?? 7,
        storeAddress,
        businessHours,
        mapLatitude,
        mapLongitude,
        facebookUrl,
        instagramUrl,
        tiktokUrl,
        twitterUrl,
        youtubeUrl,
      } as Parameters<typeof prisma.storeSettings.upsert>[0]["create"],
    });

    return NextResponse.json(settings);
  } catch (err: unknown) {
    console.error("PUT /api/store-settings error:", err);
    if (err && typeof err === "object" && "code" in err) {
      const code = (err as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "El slug ya está en uso por otra tienda" }, { status: 409 });
    }
    return NextResponse.json({ error: "Error al guardar configuración. Intentá de nuevo." }, { status: 500 });
  }
}
