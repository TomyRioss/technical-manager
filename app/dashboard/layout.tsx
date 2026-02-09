"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { DashboardProvider } from "@/contexts/dashboard-context";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  LuLogOut,
  LuHouse,
  LuPackage,
  LuReceipt,
  LuWrench,
  LuUsers,
  LuSettings,
} from "react-icons/lu";
import type { UserRole } from "@/lib/auth-check";
import type { StorePlan } from "@/lib/store-plans";

interface NavTab {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  size?: "default" | "small";
}

const allTabs: NavTab[] = [
  { label: "Inicio", href: "/dashboard", icon: LuHouse, roles: ["OWNER", "TECHNICIAN"] },
  { label: "Inventario", href: "/dashboard/inventario", icon: LuPackage, roles: ["OWNER"] },
  { label: "Órdenes", href: "/dashboard/ordenes", icon: LuWrench, roles: ["OWNER", "TECHNICIAN"] },
  { label: "Clientes", href: "/dashboard/clientes", icon: LuUsers, roles: ["OWNER", "TECHNICIAN"], size: "small" },
  { label: "Recibos", href: "/dashboard/recibos", icon: LuReceipt, roles: ["OWNER"], size: "small" },
  { label: "Config", href: "/dashboard/configuracion", icon: LuSettings, roles: ["OWNER"], size: "small" },
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
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("TECHNICIAN");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [storeSlug, setStoreSlug] = useState<string>("");
  const [storePlan, setStorePlan] = useState<StorePlan>("FREE");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        const user = JSON.parse(raw);
        if (user.storeName) setStoreName(user.storeName);
        if (user.storeId) setStoreId(user.storeId);
        if (user.id) setUserId(user.id);
        if (user.role) setUserRole(user.role);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/auth/me?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUserName(data.user.name);
          setUserEmail(data.user.email);
          if (data.user.role) setUserRole(data.user.role);
        }
      })
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!storeId) return;
    fetch(`/api/store-settings?storeId=${storeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.logoUrl) setLogoUrl(data.logoUrl);
        if (data?.slug) setStoreSlug(data.slug);
      })
      .catch(() => {});
  }, [storeId]);

  useEffect(() => {
    if (!storeId) return;
    fetch(`/api/stores/${storeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.plan) setStorePlan(data.plan);
      })
      .catch(() => {});
  }, [storeId]);

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
            className="flex items-center gap-3 text-xl font-bold tracking-tight text-neutral-900 hover:text-neutral-700 transition-colors"
          >
            {logoUrl && (
              <Image
                src={logoUrl}
                alt="Logo"
                width={36}
                height={36}
                className="rounded-md object-contain"
              />
            )}
            {storeName}
          </Link>
          <Popover>
            <PopoverTrigger asChild>
              <button className="cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-neutral-300">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-sm font-semibold text-white">
                  {(userName || storeName).charAt(0).toUpperCase()}
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-1">
              {(userName || userEmail) && (
                <div className="px-3 py-2 border-b border-neutral-200 mb-1">
                  {userName && (
                    <p className="text-sm font-medium text-neutral-900 truncate">{userName}</p>
                  )}
                  {userEmail && (
                    <p className="text-xs text-neutral-500 truncate">{userEmail}</p>
                  )}
                </div>
              )}
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
        <nav className="flex gap-0 px-6 overflow-x-auto">
          {allTabs.filter((tab) => tab.roles.includes(userRole)).map((tab) => {
            const isActive = tab.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center border-b-2 font-medium transition-colors",
                  tab.size === "small"
                    ? "gap-1 px-3 py-2 text-xs"
                    : "gap-1.5 px-4 py-2 text-sm",
                  isActive
                    ? "border-neutral-900 text-neutral-900"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                )}
              >
                <tab.icon className={tab.size === "small" ? "h-3.5 w-3.5" : "h-4 w-4"} />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 p-6">
        <DashboardProvider storeId={storeId} storeName={storeName} storeSlug={storeSlug} storePlan={storePlan} userId={userId} userRole={userRole}>
          {children}
        </DashboardProvider>
      </main>
    </div>
  );
}
