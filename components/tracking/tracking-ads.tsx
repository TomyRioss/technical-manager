"use client";

import Link from "next/link";

interface Product {
  id: string;
  name: string;
  salePrice: number;
  imageUrl: string | null;
}

interface TrackingAdsProps {
  products: Product[];
  primaryColor: string;
  slug: string;
}

export function TrackingAds({ products, primaryColor, slug }: TrackingAdsProps) {
  if (products.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50">
      <div className="px-3 py-2">
        <p className="text-xs text-neutral-500 mb-2">Productos disponibles</p>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/${slug}/tienda`}
              className="flex-shrink-0 w-24 rounded-lg border border-border overflow-hidden bg-white"
            >
              {product.imageUrl && (
                <div className="h-20 bg-neutral-100">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-1.5">
                <p className="text-xs font-medium truncate">{product.name}</p>
                <p
                  className="text-xs font-semibold"
                  style={{ color: primaryColor }}
                >
                  ${product.salePrice.toLocaleString("es-AR")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
