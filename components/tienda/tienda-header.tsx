"use client";

import { LuSearch } from "react-icons/lu";

interface TiendaHeaderProps {
  storeName: string;
  logoUrl: string | null;
  primaryColor: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function TiendaHeader({
  storeName,
  logoUrl,
  primaryColor,
  searchValue,
  onSearchChange,
}: TiendaHeaderProps) {
  return (
    <header className="bg-neutral-900 px-6 py-4">
      <div className="mx-auto max-w-6xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={storeName}
              className="h-10 w-10 rounded-full object-cover bg-white"
            />
          ) : (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {storeName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-base font-bold uppercase tracking-wide text-white">
            {storeName}
          </h1>
        </div>

        <div className="relative w-64">
          <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-full border border-neutral-600 bg-neutral-800 py-2 pl-10 pr-4 text-sm text-white placeholder-neutral-400 focus:border-neutral-500 focus:outline-none"
          />
        </div>
      </div>
    </header>
  );
}
