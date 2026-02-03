"use client";

import { useState, useMemo } from "react";
import { TiendaHeader } from "./tienda-header";
import { TiendaFilters } from "./tienda-filters";
import { TiendaProductGrid } from "./tienda-product-grid";
import { TiendaLocation } from "./tienda-location";
import { TiendaFooter } from "./tienda-footer";

interface Item {
  id: string;
  name: string;
  salePrice: number;
  stock: number;
  imageUrl: string | null;
  category: string | null;
}

interface TiendaContentProps {
  storeName: string;
  logoUrl: string | null;
  primaryColor: string;
  whatsappNumber: string | null;
  storeAddress: string | null;
  businessHours: string | null;
  googleMapsUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  twitterUrl: string | null;
  items: Item[];
}

export function TiendaContent({
  storeName,
  logoUrl,
  primaryColor,
  whatsappNumber,
  storeAddress,
  businessHours,
  googleMapsUrl,
  facebookUrl,
  instagramUrl,
  tiktokUrl,
  twitterUrl,
  items,
}: TiendaContentProps) {
  const [searchValue, setSearchValue] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.name.toLowerCase().includes(searchValue.toLowerCase());
      const matchesCategory =
        !activeCategory || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchValue, activeCategory]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <TiendaHeader
        storeName={storeName}
        logoUrl={logoUrl}
        primaryColor={primaryColor}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {categories.length > 0 && (
          <div className="mb-8">
            <TiendaFilters
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              primaryColor={primaryColor}
            />
          </div>
        )}

        <TiendaProductGrid
          items={filteredItems}
          whatsappNumber={whatsappNumber}
          storeName={storeName}
          primaryColor={primaryColor}
        />

        <TiendaLocation
          storeAddress={storeAddress}
          businessHours={businessHours}
          googleMapsUrl={googleMapsUrl}
        />
      </main>

      <TiendaFooter
        storeName={storeName}
        facebookUrl={facebookUrl}
        instagramUrl={instagramUrl}
        tiktokUrl={tiktokUrl}
        twitterUrl={twitterUrl}
      />
    </div>
  );
}
