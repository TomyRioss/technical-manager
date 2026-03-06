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

// Format while typing: thousands dots on integer part, no forced decimals
function formatWhileTyping(raw: string): string {
  // Strip existing thousand separators
  const stripped = raw.replace(/\./g, "");
  const commaIndex = stripped.indexOf(",");
  let intPart: string;
  let decPart: string | null = null;

  if (commaIndex !== -1) {
    intPart = stripped.slice(0, commaIndex);
    decPart = stripped.slice(commaIndex + 1);
  } else {
    intPart = stripped;
  }

  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  if (decPart !== null) {
    return `${intFormatted},${decPart}`;
  }
  return intFormatted;
}

function parseDisplay(display: string): number {
  // Remove thousand separators (dots), replace comma with dot for parseFloat
  const normalized = display.replace(/\./g, "").replace(",", ".");
  return parseFloat(normalized) || 0;
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
  const isFocused = React.useRef(false);

  React.useEffect(() => {
    if (!isFocused.current) {
      setDisplay(formatForDisplay(value));
    }
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // Allow only digits, dots (thousands) and one comma (decimal)
    const cleaned = raw.replace(/[^\d.,]/g, "");
    // Only allow one comma
    const parts = cleaned.split(",");
    const sanitized = parts.length > 2 ? parts[0] + "," + parts.slice(1).join("") : cleaned;

    const formatted = formatWhileTyping(sanitized);
    setDisplay(formatted);

    const num = parseDisplay(formatted);
    const finalValue = num < min ? min : num;
    onChange(finalValue);
  }

  function handleBlur() {
    isFocused.current = false;
    const num = parseDisplay(display);
    const finalValue = num < min ? min : num;
    setDisplay(finalValue === 0 ? "" : formatForDisplay(finalValue));
    onBlur?.();
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      onFocus={() => { isFocused.current = true; }}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      autoFocus={autoFocus}
    />
  );
}

export { PriceInput };
