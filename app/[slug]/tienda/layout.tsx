"use client";

import { CartProvider } from "@/contexts/cart-context";
import { use, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export default function TiendaLayout({ children, params }: Props) {
  const { slug } = use(params);
  return <CartProvider slug={slug}>{children}</CartProvider>;
}
