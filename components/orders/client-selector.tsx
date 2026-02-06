"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ClientTagBadge } from "@/components/clients/client-tag-badge";
import { Users, Search } from "lucide-react";
import type { ClientTag } from "@/types/client";

interface ClientOption {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  tag: ClientTag;
}

interface ClientSelectorProps {
  storeId: string;
  selectedId: string | null;
  onSelect: (client: ClientOption | null) => void;
}

export function ClientSelector({ storeId, selectedId, onSelect }: ClientSelectorProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClientOption[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selected, setSelected] = useState<ClientOption | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [allClients, setAllClients] = useState<ClientOption[]>([]);
  const [directorySearch, setDirectorySearch] = useState("");
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Búsqueda en el input principal
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/clients/search?storeId=${storeId}&q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, storeId]);

  // Cargar todos los clientes cuando se abre el directorio
  useEffect(() => {
    if (sheetOpen && allClients.length === 0) {
      setLoadingDirectory(true);
      fetch(`/api/clients?storeId=${storeId}`)
        .then((res) => res.ok ? res.json() : [])
        .then((data) => setAllClients(data))
        .finally(() => setLoadingDirectory(false));
    }
  }, [sheetOpen, storeId, allClients.length]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(client: ClientOption) {
    setSelected(client);
    setQuery(client.name);
    setShowResults(false);
    setSheetOpen(false);
    onSelect(client);
  }

  function handleClear() {
    setSelected(null);
    setQuery("");
    onSelect(null);
  }

  // Filtrar clientes del directorio
  const filteredClients = directorySearch.length >= 2
    ? allClients.filter((c) =>
        c.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
        c.phone?.includes(directorySearch) ||
        c.email?.toLowerCase().includes(directorySearch.toLowerCase())
      )
    : allClients;

  return (
    <div ref={wrapperRef} className="space-y-2 relative">
      <Label>Cliente *</Label>
      <div className="flex gap-2">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Users className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 sm:w-96">
            <SheetHeader>
              <SheetTitle>Directorio de Clientes</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente..."
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="h-[calc(100vh-200px)] overflow-y-auto space-y-1">
                {loadingDirectory ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Cargando...</p>
                ) : filteredClients.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay clientes</p>
                ) : (
                  filteredClients.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelect(c)}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-md text-sm cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{c.name}</span>
                        <ClientTagBadge tag={c.tag} />
                      </div>
                      {c.phone && (
                        <span className="text-xs text-muted-foreground">{c.phone}</span>
                      )}
                    </button>
                  ))
                )}
                <Link
                  href="/dashboard/clientes/create"
                  className="block text-sm text-sky-500 hover:text-sky-600 hover:underline px-3 py-3 mt-2 border-t"
                >
                  + Añadir cliente
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex-1">
          {selected ? (
            <div className="flex items-center gap-2 rounded-md border border-border p-2 h-10">
              <span className="text-sm font-medium flex-1">{selected.name}</span>
              <ClientTagBadge tag={selected.tag} />
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-neutral-500 hover:text-neutral-700 cursor-pointer"
              >
                Cambiar
              </button>
            </div>
          ) : (
            <Input
              placeholder="Buscar cliente por nombre, teléfono..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
            />
          )}
        </div>
      </div>

      <Link
        href="/dashboard/clientes/create"
        className="text-sm text-sky-500 hover:text-sky-600 hover:underline"
      >
        + Añadir cliente
      </Link>

      {showResults && results.length > 0 && !selected && (
        <div className="absolute z-10 top-full mt-1 w-full bg-white border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {results.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelect(c)}
              className="w-full text-left px-3 py-2 hover:bg-neutral-50 text-sm flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="font-medium">{c.name}</span>
                {c.phone && <span className="text-neutral-500 ml-2">{c.phone}</span>}
              </div>
              <ClientTagBadge tag={c.tag} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
