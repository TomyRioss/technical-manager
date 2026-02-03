"use client";

import { useState, useEffect } from "react";
import { LuClock, LuMapPin, LuNavigation } from "react-icons/lu";

interface BusinessHours {
  weekdays: string | null;
  saturday: string | null;
  sunday: string | null;
}

interface TiendaLocationProps {
  storeAddress: string | null;
  businessHours: string | null;
  googleMapsUrl: string | null;
}

function parseBusinessHours(json: string | null): BusinessHours | null {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function parseCoordinatesFromUrl(url: string): { lat: string; lng: string } | null {
  const patterns = [
    /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { lat: match[1], lng: match[2] };
    }
  }
  return null;
}

export function TiendaLocation({
  storeAddress,
  businessHours,
  googleMapsUrl,
}: TiendaLocationProps) {
  const hours = parseBusinessHours(businessHours);
  const hasHours = hours && (hours.weekdays || hours.saturday || hours.sunday);
  const hasAddress = !!storeAddress;

  const [coordinates, setCoordinates] = useState<{ lat: string; lng: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!googleMapsUrl) return;

    // Intentar parsear coordenadas directamente
    const coords = parseCoordinatesFromUrl(googleMapsUrl);
    if (coords) {
      setCoordinates(coords);
      return;
    }

    // Si es link corto, resolver via API
    if (googleMapsUrl.includes("goo.gl") || googleMapsUrl.includes("maps.app")) {
      setLoading(true);
      fetch("/api/resolve-maps-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: googleMapsUrl }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.lat && data.lng) {
            setCoordinates({ lat: data.lat, lng: data.lng });
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [googleMapsUrl]);

  const hasMap = coordinates !== null;
  const mapEmbedUrl = hasMap
    ? `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=15&output=embed`
    : null;

  if (!hasAddress && !hasHours && !googleMapsUrl) {
    return null;
  }

  return (
    <section className="mt-12 rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-6 text-xl font-bold text-neutral-900">
        NUESTRA TIENDA
      </h2>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          {hasAddress && (
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                <LuMapPin className="h-5 w-5 text-neutral-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">DIRECCIÓN</p>
                <p className="mt-0.5 text-sm text-neutral-600 whitespace-pre-line">
                  {storeAddress}
                </p>
              </div>
            </div>
          )}

          {hasHours && (
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                <LuClock className="h-5 w-5 text-neutral-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">HORARIOS</p>
                <div className="mt-0.5 text-sm text-neutral-600">
                  {hours!.weekdays && <p>Lunes a Viernes: {hours!.weekdays}</p>}
                  {hours!.saturday && <p>Sábados: {hours!.saturday}</p>}
                  {hours!.sunday && <p>Domingos: {hours!.sunday}</p>}
                </div>
              </div>
            </div>
          )}

          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              <LuNavigation className="h-4 w-4" />
              Cómo llegar al local?
            </a>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center h-[280px] bg-neutral-100 rounded-lg">
            <p className="text-sm text-neutral-500">Cargando mapa...</p>
          </div>
        )}

        {!loading && mapEmbedUrl && (
          <div className="overflow-hidden rounded-lg border border-neutral-200">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="280"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa de ubicación"
            />
          </div>
        )}
      </div>
    </section>
  );
}
