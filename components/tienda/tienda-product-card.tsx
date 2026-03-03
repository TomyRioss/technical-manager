"use client";

import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/utils";
import { LuShoppingCart, LuCheck } from "react-icons/lu";
import { useState } from "react";

interface TiendaProductCardProps {
  id: string;
  slug: string;
  name: string;
  salePrice: number;
  stock: number;
  imageUrl: string | null;
  category: string | null;
  primaryColor: string;
}

export function TiendaProductCard({
  id,
  slug,
  name,
  salePrice,
  stock,
  imageUrl,
  category,
}: TiendaProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const isOutOfStock = stock === 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart({ id, name, salePrice, stock, imageUrl });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <Link
      href={`/${slug}/tienda/producto/${id}`}
      className="flex flex-col rounded-lg border border-neutral-200 bg-white overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className={`h-48 w-full object-cover ${isOutOfStock ? "opacity-60" : ""}`}
          />
        ) : (
          <div className={`h-48 w-full bg-neutral-100 flex items-center justify-center ${isOutOfStock ? "opacity-60" : ""}`}>
            <span className="text-4xl text-neutral-300">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {category && (
          <span className="absolute top-2 right-2 rounded bg-neutral-800 px-2 py-1 text-xs font-medium text-white">
            {category}
          </span>
        )}

        {isOutOfStock && (
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-neutral-800/90 px-3 py-1.5 text-xs font-semibold text-white">
            AGOTADO
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-medium text-neutral-900 line-clamp-2">
          {name}
        </h3>
        <p className="mt-1 text-lg font-bold text-neutral-900">
          ${formatPrice(salePrice)}
        </p>

        <div className="mt-1 flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-xs text-neutral-500">
            STOCK: {stock}
          </span>
        </div>

        <button
          onClick={handleAdd}
          className={`mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white transition-colors ${
            isOutOfStock
              ? "cursor-not-allowed bg-neutral-400"
              : added
                ? "bg-green-600"
                : "bg-neutral-900 hover:bg-neutral-800"
          }`}
        >
          {added ? (
            <>
              <LuCheck className="h-4 w-4" />
              Agregado
            </>
          ) : (
            <>
              <LuShoppingCart className="h-4 w-4" />
              {isOutOfStock ? "AGOTADO" : "Agregar"}
            </>
          )}
        </button>
      </div>
    </Link>
  );
}
