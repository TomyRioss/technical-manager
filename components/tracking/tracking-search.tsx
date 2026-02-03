"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LuSearch } from "react-icons/lu";

interface TrackingSearchProps {
  onSearch: (orderCode: string) => void;
  loading: boolean;
}

export function TrackingSearch({ onSearch, loading }: TrackingSearchProps) {
  const [code, setCode] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim()) onSearch(code.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Ingresá tu código de orden (ej: OT-20250101-001)"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={loading || !code.trim()}>
        <LuSearch className="h-4 w-4 mr-1" />
        Buscar
      </Button>
    </form>
  );
}
