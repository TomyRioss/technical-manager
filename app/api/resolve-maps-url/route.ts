import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL requerida" }, { status: 400 });
    }

    // Seguir redirecciones para obtener la URL final
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
    });

    const finalUrl = response.url;

    // Parsear coordenadas de la URL final
    const patterns = [
      /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,
    ];

    for (const pattern of patterns) {
      const match = finalUrl.match(pattern);
      if (match) {
        const lat = match[1];
        const lng = match[2];

        // Reverse geocoding con Nominatim
        let address: string | null = null;
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "User-Agent": "TechnicalManager/1.0" } }
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData.display_name) {
              address = geoData.display_name;
            }
          }
        } catch {}

        return NextResponse.json({
          lat,
          lng,
          address,
          resolvedUrl: finalUrl,
        });
      }
    }

    return NextResponse.json({ error: "No se encontraron coordenadas", resolvedUrl: finalUrl }, { status: 404 });
  } catch (err) {
    console.error("Error resolviendo URL:", err);
    return NextResponse.json({ error: "Error al resolver URL" }, { status: 500 });
  }
}
