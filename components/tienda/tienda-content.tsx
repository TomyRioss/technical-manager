"use client";

import { useState, useMemo, useEffect } from "react";
import { TiendaHeader } from "./tienda-header";
import { TiendaFilters } from "./tienda-filters";
import { TiendaProductGrid } from "./tienda-product-grid";
import { TiendaLocation } from "./tienda-location";
import { TiendaFooter } from "./tienda-footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 20;

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
  const [currentPage, setCurrentPage] = useState(1);

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

  // Reset página cuando cambia búsqueda o categoría
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, activeCategory]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          items={paginatedItems}
          whatsappNumber={whatsappNumber}
          storeName={storeName}
          primaryColor={primaryColor}
        />

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm text-neutral-600">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}

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
