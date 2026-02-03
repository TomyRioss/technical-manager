import { prisma } from "@/lib/prisma";
import { TiendaContent } from "@/components/tienda/tienda-content";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const settings = await prisma.storeSettings.findUnique({
    where: { slug },
    include: { store: { select: { name: true } } },
  });
  if (!settings) return { title: "Tienda no encontrada" };
  return {
    title: `${settings.store.name} - Tienda`,
    description: `Catalogo de productos de ${settings.store.name}`,
  };
}

export default async function TiendaPage({ params }: Props) {
  const { slug } = await params;

  const settings = await prisma.storeSettings.findUnique({
    where: { slug },
    include: { store: { select: { name: true } } },
  });

  if (!settings) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-neutral-500">Tienda no encontrada.</p>
      </div>
    );
  }

  const items = await prisma.item.findMany({
    where: { storeId: settings.storeId, isActive: true },
    orderBy: { name: "asc" },
    include: { category: { select: { name: true } } } as any,
  });

  const mappedItems = items.map((item) => {
    const cat = (item as any).category as { name: string } | null;
    return {
      id: item.id,
      name: item.name,
      salePrice: item.salePrice,
      stock: item.stock,
      imageUrl: item.imageUrl,
      category: cat?.name ?? null,
    };
  });

  const s = settings as {
    storeAddress?: string | null;
    businessHours?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    tiktokUrl?: string | null;
    twitterUrl?: string | null;
  };

  return (
    <TiendaContent
      storeName={settings.store.name}
      logoUrl={settings.logoUrl}
      primaryColor={settings.primaryColor}
      whatsappNumber={settings.whatsappNumber}
      storeAddress={s.storeAddress ?? null}
      businessHours={s.businessHours ?? null}
      googleMapsUrl={settings.googleMapsUrl}
      facebookUrl={s.facebookUrl ?? null}
      instagramUrl={s.instagramUrl ?? null}
      tiktokUrl={s.tiktokUrl ?? null}
      twitterUrl={s.twitterUrl ?? null}
      items={mappedItems}
    />
  );
}
