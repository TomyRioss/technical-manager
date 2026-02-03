"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { TrackingBranding } from "@/components/tracking/tracking-branding";
import { TrackingSearch } from "@/components/tracking/tracking-search";
import { TrackingResult } from "@/components/tracking/tracking-result";
import { TrackingAds } from "@/components/tracking/tracking-ads";

interface StoreInfo {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  welcomeMessage: string | null;
  googleMapsUrl: string | null;
}

interface Product {
  id: string;
  name: string;
  salePrice: number;
  imageUrl: string | null;
}

export default function TrackingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(false);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    async function loadStore() {
      const res = await fetch(`/api/tracking/store?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        setStoreInfo(data.store);
        setProducts(data.featuredProducts ?? []);
      }
    }
    loadStore();
  }, [slug]);

  async function handleSearch(orderCode: string) {
    setLoading(true);
    setError(null);
    setOrder(null);
    setSearched(true);

    const res = await fetch(
      `/api/tracking?slug=${encodeURIComponent(slug)}&orderCode=${encodeURIComponent(orderCode)}`
    );

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Orden no encontrada");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setStoreInfo(data.store);
    setOrder(data.order);
    setProducts(data.featuredProducts ?? []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className={`mx-auto max-w-lg px-4 py-8 space-y-6 ${products.length > 0 ? "pb-32" : ""}`}>
        {storeInfo ? (
          <TrackingBranding
            storeName={storeInfo.name}
            logoUrl={storeInfo.logoUrl}
            primaryColor={storeInfo.primaryColor}
            welcomeMessage={storeInfo.welcomeMessage}
          />
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-neutral-900">Seguimiento de Orden</h1>
            <p className="text-sm text-neutral-600 mt-1">
              Ingresá tu código de orden para ver el estado.
            </p>
          </div>
        )}

        <TrackingSearch onSearch={handleSearch} loading={loading} />

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {order && storeInfo && (
          <TrackingResult
            order={order as never}
            primaryColor={storeInfo.primaryColor}
          />
        )}

        {searched && !loading && !order && !error && (
          <p className="text-sm text-neutral-500 text-center">No se encontraron resultados.</p>
        )}

              </div>

      {storeInfo && products.length > 0 && (
        <TrackingAds
          products={products}
          primaryColor={storeInfo.primaryColor}
          slug={slug}
        />
      )}
    </div>
  );
}
