"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DashboardProvider } from "@/contexts/dashboard-context";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LuLogOut, LuHouse, LuPackage, LuReceipt } from "react-icons/lu";

const tabs = [
  { label: "Inicio", href: "/dashboard", icon: LuHouse },
  { label: "Inventario", href: "/dashboard/inventario", icon: LuPackage },
  { label: "Recibos", href: "/dashboard/recibos", icon: LuReceipt },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [storeName, setStoreName] = useState("Mi Local");
  const [storeId, setStoreId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        const user = JSON.parse(raw);
        if (user.storeName) setStoreName(user.storeName);
        if (user.storeId) setStoreId(user.storeId);
        if (user.id) setUserId(user.id);
      } catch {}
    }
  }, []);

  if (!storeId || !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-neutral-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="border-b border-border bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight text-neutral-900 hover:text-neutral-700 transition-colors"
          >
            {storeName}
          </Link>
          <Popover>
            <PopoverTrigger asChild>
              <button className="cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-neutral-300">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-sm font-semibold text-white">
                  {storeName.charAt(0).toUpperCase()}
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-1">
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                onClick={() => {
                  localStorage.removeItem("user");
                  router.push("/");
                }}
              >
                <LuLogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </PopoverContent>
          </Popover>
        </div>
        {/* Tabs */}
        <nav className="flex gap-0 px-6">
          {tabs.map((tab) => {
            const isActive = tab.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-neutral-900 text-neutral-900"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 p-6">
        <DashboardProvider storeId={storeId} userId={userId}>
          {children}
        </DashboardProvider>
      </main>
    </div>
  );
}
