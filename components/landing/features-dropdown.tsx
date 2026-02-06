"use client";

import Link from "next/link";
import { Megaphone, ShoppingCart, Settings } from "lucide-react";

const categories = [
  {
    title: "Marketing",
    icon: Megaphone,
    href: "/marketing",
    description: "Conseguí más clientes, vende más y date a conocer.",
    items: [
      "Campañas de Marketing",
      "Seguimiento de usuarios",
      "Cupones de descuento",
    ],
  },
  {
    title: "Ventas",
    icon: ShoppingCart,
    href: "/sales",
    description:
      "Herramientas para vender más, cobrar sin complicaciones y obtener más ventas.",
    items: ["POS (Punto de venta)", "Catálogo Web de Productos", "Chatbot"],
  },
  {
    title: "Optimización",
    icon: Settings,
    href: "/optimization",
    description:
      "Optimiza tus procesos, mejora tú eficiencia y abarata costos para tener las mejores ganancias posibles de tú negocio.",
    items: [
      "Buscador para clientes",
      "Seguimiento automático de clientes",
      "Gestión de inventario",
      "Generación de recibos",
      "Estadísticas generales",
    ],
  },
];

export function FeaturesDropdown() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 w-full md:w-[700px] bg-white rounded-lg border">
      {categories.map((category) => (
        <div key={category.title} className="space-y-3">
          <div className="flex items-center gap-2">
            <category.icon className="h-5 w-5 text-primary" />
            {category.href ? (
              <Link href={category.href} className="font-semibold hover:text-primary hover:underline transition-colors">
                {category.title}
              </Link>
            ) : (
              <h3 className="font-semibold">{category.title}</h3>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{category.description}</p>
          <ul className="space-y-2">
            {category.items.map((item) => (
              <li key={item}>
                <Link
                  href={category.href}
                  className="text-sm hover:text-primary hover:underline transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
