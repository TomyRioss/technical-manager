"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  min?: number;
}

function formatForDisplay(value: number): string {
  if (value === 0) return "";
  return value.toLocaleString("es-AR");
}

function PriceInput({
  value,
  onChange,
  placeholder = "0",
  id,
  className,
  min = 0,
}: PriceInputProps) {
  const [display, setDisplay] = React.useState(() => formatForDisplay(value));

  React.useEffect(() => {
    setDisplay(formatForDisplay(value));
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\./g, "").replace(/,/g, "");
    const num = parseFloat(raw) || 0;
    const finalValue = min !== undefined && num < min ? min : num;
    setDisplay(finalValue === 0 ? "" : finalValue.toLocaleString("es-AR"));
    onChange(finalValue);
  }

  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
}

export { PriceInput };
