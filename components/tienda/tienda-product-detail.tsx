"use client";

import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/utils";
import { LuArrowLeft, LuShoppingCart, LuCheck, LuLoaderCircle } from "react-icons/lu";
import { useState } from "react";
import { TiendaCartDrawer } from "./tienda-cart-drawer";

interface Product {
  id: string;
  name: string;
  description: string | null;
  salePrice: number;
  stock: number;
  imageUrl: string | null;
  category: string | null;
}

interface TiendaProductDetailProps {
  slug: string;
  branchSlug: string | null;
  branchId: string;
  whatsappNumber: string | null;
  product: Product;
  storeName: string;
  logoUrl: string | null;
  primaryColor: string;
  similarProducts: Product[];
  suggestedProducts: Product[];
}

function MiniProductCard({ item, slug }: { item: Product; slug: string }) {
  return (
    <Link
      href={`/${slug}/tienda/producto/${item.id}`}
      className="flex flex-col rounded-lg border border-neutral-200 bg-white overflow-hidden transition-shadow hover:shadow-md"
    >
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.name} className="h-32 w-full object-cover" />
      ) : (
        <div className="h-32 w-full bg-neutral-100 flex items-center justify-center">
          <span className="text-3xl text-neutral-300">{item.name.charAt(0).toUpperCase()}</span>
        </div>
      )}
      <div className="p-3">
        <h4 className="text-xs font-medium text-neutral-900 line-clamp-2">{item.name}</h4>
        <p className="mt-1 text-sm font-bold text-neutral-900">${formatPrice(item.salePrice)}</p>
      </div>
    </Link>
  );
}

export function TiendaProductDetail({
  slug,
  branchSlug,
  branchId,
  whatsappNumber,
  product,
  storeName,
  logoUrl,
  primaryColor,
  similarProducts,
  suggestedProducts,
}: TiendaProductDetailProps) {
  const { addToCart, setIsCartOpen, getItemCount } = useCart();
  const [added, setAdded] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      salePrice: product.salePrice,
      stock: product.stock,
      imageUrl: product.imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = async () => {
    setBuyingNow(true);
    setBuyError(null);
    try {
      const orderItems = [{
        productId: product.id,
        name: product.name,
        quantity: 1,
        unitPrice: product.salePrice,
        lineTotal: product.salePrice,
      }];

      const res = await fetch("/api/tienda/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, branchId, items: orderItems }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear el pedido");
      }

      const { receiptNumber } = await res.json();

      if (whatsappNumber) {
        const msg = encodeURIComponent(
          `Hola! Quiero comprar:\n\n- ${product.name} x1 ($${formatPrice(product.salePrice)})\n\nTotal: $${formatPrice(product.salePrice)}\n\nPedido: ${receiptNumber}\nQuedo a la espera de confirmación.`
        );
        window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank");
      }
    } catch (err) {
      console.error("Error creating order:", err);
      setBuyError(err instanceof Error ? err.message : "Error al crear el pedido");
    } finally {
      setBuyingNow(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-neutral-900 px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-10 w-10 rounded-full object-cover bg-white" />
            ) : (
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {storeName.charAt(0).toUpperCase()}
              </div>
            )}
            <h1 className="text-base font-bold uppercase tracking-wide text-white">{storeName}</h1>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative rounded-full p-2 text-white hover:bg-neutral-800 cursor-pointer"
          >
            <LuShoppingCart className="h-5 w-5" />
            {getItemCount() > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {getItemCount()}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        {/* Back link */}
        <Link
          href={branchSlug ? `/${slug}/tienda/${branchSlug}` : `/${slug}/tienda`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <LuArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>

        {/* Product detail */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Image */}
          <div className="relative">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className={`w-full rounded-lg object-cover aspect-square ${isOutOfStock ? "opacity-60" : ""}`}
              />
            ) : (
              <div className={`w-full rounded-lg bg-neutral-100 flex items-center justify-center aspect-square ${isOutOfStock ? "opacity-60" : ""}`}>
                <span className="text-7xl text-neutral-300">{product.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            {isOutOfStock && (
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-neutral-800/90 px-4 py-2 text-sm font-semibold text-white">
                AGOTADO
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.category && (
              <span className="mb-2 inline-block w-fit rounded bg-neutral-800 px-2.5 py-1 text-xs font-medium text-white">
                {product.category}
              </span>
            )}
            <h2 className="text-2xl font-bold text-neutral-900">{product.name}</h2>
            <p className="mt-2 text-3xl font-bold text-neutral-900">${formatPrice(product.salePrice)}</p>

            <div className="mt-3 flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm text-neutral-500">
                {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}
              </span>
            </div>

            {product.description && (
              <p className="mt-4 text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors ${
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
                    {isOutOfStock ? "AGOTADO" : "Agregar al carrito"}
                  </>
                )}
              </button>
              {!isOutOfStock && (
                <button
                  onClick={handleBuyNow}
                  disabled={buyingNow}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {buyingNow ? (
                    <>
                      <LuLoaderCircle className="h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Comprar ahora"
                  )}
                </button>
              )}
            </div>
            {buyError && (
              <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{buyError}</p>
            )}
          </div>
        </div>

        {/* Similar products */}
        {similarProducts.length > 0 && (
          <section className="mt-12">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">Productos similares</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {similarProducts.map((item) => (
                <MiniProductCard key={item.id} item={item} slug={slug} />
              ))}
            </div>
          </section>
        )}

        {/* Suggested products */}
        {suggestedProducts.length > 0 && (
          <section className="mt-12">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">Podría gustarte</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {suggestedProducts.map((item) => (
                <MiniProductCard key={item.id} item={item} slug={slug} />
              ))}
            </div>
          </section>
        )}
      </main>

      <TiendaCartDrawer
        slug={slug}
        branchId={branchId}
        whatsappNumber={whatsappNumber}
      />
    </div>
  );
}
