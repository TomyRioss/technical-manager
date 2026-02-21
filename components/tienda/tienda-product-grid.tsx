import { TiendaProductCard } from "./tienda-product-card";

interface Item {
  id: string;
  name: string;
  salePrice: number;
  stock: number;
  imageUrl: string | null;
  category: string | null;
}

interface TiendaProductGridProps {
  items: Item[];
  slug: string;
  primaryColor: string;
}

export function TiendaProductGrid({
  items,
  slug,
  primaryColor,
}: TiendaProductGridProps) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-neutral-500">No hay productos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <TiendaProductCard
          key={item.id}
          id={item.id}
          slug={slug}
          name={item.name}
          salePrice={item.salePrice}
          stock={item.stock}
          imageUrl={item.imageUrl}
          category={item.category}
          primaryColor={primaryColor}
        />
      ))}
    </div>
  );
}
