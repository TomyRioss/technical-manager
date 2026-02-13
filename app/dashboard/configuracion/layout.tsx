"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LuPaintbrush, LuSmartphone, LuPercent, LuTags, LuUsers, LuDownload } from "react-icons/lu";

const configTabs = [
  { label: "General", href: "/dashboard/configuracion", icon: LuPaintbrush },
  { label: "Equipo", href: "/dashboard/configuracion/equipo", icon: LuUsers },
  { label: "Categorias", href: "/dashboard/configuracion/categorias", icon: LuTags },
  { label: "Dispositivos", href: "/dashboard/configuracion/dispositivos", icon: LuSmartphone },
  { label: "Comisiones", href: "/dashboard/configuracion/comisiones", icon: LuPercent },
  { label: "Exportar", href: "/dashboard/exportar", icon: LuDownload },
];

export default function ConfiguracionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-6">
        <nav className="flex sm:flex-col gap-1 sm:w-48 shrink-0 overflow-x-auto">
          {configTabs.map((tab) => {
            const isActive =
              tab.href === "/dashboard/configuracion"
                ? pathname === "/dashboard/configuracion"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
