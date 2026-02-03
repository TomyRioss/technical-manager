"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientTagBadge } from "@/components/clients/client-tag-badge";
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
  const wrapperRef = useRef<HTMLDivElement>(null);

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
    onSelect(client);
  }

  function handleClear() {
    setSelected(null);
    setQuery("");
    onSelect(null);
  }

  return (
    <div ref={wrapperRef} className="space-y-2 relative">
      <Label>Cliente *</Label>
      {selected ? (
        <div className="flex items-center gap-2 rounded-md border border-border p-2">
          <span className="text-sm font-medium flex-1">{selected.name}</span>
          <ClientTagBadge tag={selected.tag} />
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-neutral-500 hover:text-neutral-700"
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
      {!selected && (
        <Link
          href="/dashboard/clientes/create"
          className="text-sm text-sky-500 hover:text-sky-600 hover:underline"
        >
          + Añadir cliente
        </Link>
      )}
      {showResults && results.length > 0 && !selected && (
        <div className="absolute z-10 top-full mt-1 w-full bg-white border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {results.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelect(c)}
              className="w-full text-left px-3 py-2 hover:bg-neutral-50 text-sm flex items-center justify-between"
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
