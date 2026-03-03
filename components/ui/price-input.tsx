"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  placeholder?: string;
  id?: string;
  className?: string;
  min?: number;
  autoFocus?: boolean;
}

function formatForDisplay(value: number): string {
  if (value === 0) return "";
  const [int, dec] = value.toFixed(2).split(".");
  const intFormatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${intFormatted},${dec}`;
}

function PriceInput({
  value,
  onChange,
  onBlur,
  placeholder = "0",
  id,
  className,
  min = 0,
  autoFocus,
}: PriceInputProps) {
  const [display, setDisplay] = React.useState(() => formatForDisplay(value));

  React.useEffect(() => {
    setDisplay(formatForDisplay(value));
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\./g, "").replace(/,/g, "");
    const num = parseFloat(raw) || 0;
    const finalValue = min !== undefined && num < min ? min : num;
    setDisplay(finalValue === 0 ? "" : formatForDisplay(finalValue));
    onChange(finalValue);
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      autoFocus={autoFocus}
      onBlur={onBlur}
    />
  );
}

export { PriceInput };
