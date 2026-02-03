"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DeviceOption } from "@/types/device";

interface DeviceModelInputProps {
  storeId: string;
  value: string;
  onChange: (value: string) => void;
}

export function DeviceModelInput({ storeId, value, onChange }: DeviceModelInputProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<DeviceOption[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selected, setSelected] = useState(!!value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected || !query || query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(
        `/api/devices/search?storeId=${storeId}&q=${encodeURIComponent(query)}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, storeId, selected]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(option: DeviceOption) {
    setQuery(option.displayName);
    onChange(option.displayName);
    setSelected(true);
    setShowResults(false);
  }

  function handleClear() {
    setQuery("");
    onChange("");
    setSelected(false);
    setResults([]);
  }

  function handleInputChange(val: string) {
    setQuery(val);
    onChange(val);
    setSelected(false);
    setShowResults(true);
  }

  return (
    <div ref={wrapperRef} className="space-y-2 relative">
      <Label htmlFor="deviceModel">Modelo del equipo *</Label>
      {selected && value ? (
        <div className="flex items-center gap-2 rounded-md border border-border p-2">
          <span className="text-sm font-medium flex-1">{value}</span>
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
          id="deviceModel"
          placeholder="Buscar dispositivo... Ej: Samsung Galaxy S23"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          required
        />
      )}
      <Link
        href="/dashboard/configuracion/dispositivos"
        className="text-sm text-sky-500 hover:text-sky-600 hover:underline"
      >
        + Añadir dispositivo
      </Link>
      {showResults && results.length > 0 && !selected && (
        <div className="absolute z-10 top-full mt-1 w-full bg-white border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {results.map((opt) => (
            <button
              key={opt.modelId}
              type="button"
              onClick={() => handleSelect(opt)}
              className="w-full text-left px-3 py-2 hover:bg-neutral-50 text-sm"
            >
              <span className="font-medium">{opt.brandName}</span>
              <span className="text-neutral-500 ml-1">{opt.modelName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
