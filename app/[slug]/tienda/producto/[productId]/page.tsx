import { prisma } from "@/lib/db";
import { TiendaProductDetail } from "@/components/tienda/tienda-product-detail";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string; productId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  const item = await prisma.item.findUnique({ where: { id: productId }, select: { name: true } });
  if (!item) return { title: "Producto no encontrado" };
  return { title: item.name };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug, productId } = await params;

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

  const item = await prisma.item.findUnique({
    where: { id: productId },
    include: { category: { select: { id: true, name: true } } } as any,
  });

  if (!item || item.storeId !== settings.storeId || !item.isActive) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-neutral-500">Producto no encontrado.</p>
      </div>
    );
  }

  const cat = (item as any).category as { id: string; name: string } | null;

  // Similar products (same category)
  const similarWhere: Record<string, unknown> = {
    storeId: settings.storeId,
    branchId: item.branchId,
    isActive: true,
    id: { not: item.id },
  };
  if (cat) similarWhere.categoryId = cat.id;

  const similarItems = cat
    ? await prisma.item.findMany({
        where: similarWhere,
        take: 4,
        orderBy: { name: "asc" },
        include: { category: { select: { name: true } } } as any,
      })
    : [];

  // "Podría gustarte" - random from same branch, different category
  const suggestedWhere: Record<string, unknown> = {
    storeId: settings.storeId,
    branchId: item.branchId,
    isActive: true,
    id: { not: item.id },
  };
  if (cat) suggestedWhere.categoryId = { not: cat.id };

  const suggestedItems = await prisma.item.findMany({
    where: suggestedWhere,
    take: 4,
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true } } } as any,
  });

  // Get branch slug for back navigation
  const branch = item.branchId
    ? await prisma.branch.findUnique({
        where: { id: item.branchId },
        select: { slug: true, isDefault: true },
      })
    : null;

  const branchSlug = branch && !branch.isDefault && branch.slug ? branch.slug : null;

  const mapItem = (i: typeof item) => {
    const c = (i as any).category as { name: string } | null;
    return {
      id: i.id,
      name: i.name,
      description: (i as any).description ?? null,
      salePrice: i.salePrice,
      stock: i.stock,
      imageUrl: i.imageUrl,
      category: c?.name ?? null,
    };
  };

  return (
    <TiendaProductDetail
      slug={slug}
      branchSlug={branchSlug}
      branchId={item.branchId ?? ""}
      whatsappNumber={settings.whatsappNumber}
      product={{
        id: item.id,
        name: item.name,
        description: (item as any).description ?? null,
        salePrice: item.salePrice,
        stock: item.stock,
        imageUrl: item.imageUrl,
        category: cat?.name ?? null,
      }}
      storeName={settings.store.name}
      logoUrl={settings.logoUrl}
      primaryColor={settings.primaryColor}
      similarProducts={similarItems.map(mapItem)}
      suggestedProducts={suggestedItems.map(mapItem)}
    />
  );
}
