"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { LuLogOut, LuLayoutDashboard } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FeaturesDropdown } from "./features-dropdown";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Precios", href: "/pricing" },
  { label: "Integraciones", href: "/integraciones" },
  { label: "Contacto", href: "/contact" },
  { label: "Ayuda", href: "/ayuda" },
];

interface User {
  name?: string;
  email?: string;
}

export function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <Image src="/tipologo.png" alt="Logo" width={120} height={32} />
          </Link>

          {/* Navegación central - oculta en móvil */}
          <div className="hidden md:flex items-center gap-6">
            {/* Características con dropdown */}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <button
                  className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors"
                  onMouseEnter={() => setIsOpen(true)}
                  onMouseLeave={() => setIsOpen(false)}
                >
                  Características
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0 border-none shadow-lg"
                align="center"
                sideOffset={8}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
              >
                <FeaturesDropdown />
              </PopoverContent>
            </Popover>

            {/* Otros items */}
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Botones / Avatar */}
          {user ? (
            <Popover>
              <PopoverTrigger asChild>
                <button className="cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-neutral-300">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-sm font-semibold text-white">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 p-1">
                {(user.name || user.email) && (
                  <div className="px-3 py-2 border-b border-neutral-200 mb-1">
                    {user.name && (
                      <p className="text-sm font-medium text-neutral-900 truncate">{user.name}</p>
                    )}
                    {user.email && (
                      <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    )}
                  </div>
                )}
                <Link
                  href="/dashboard"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <LuLayoutDashboard className="h-4 w-4" />
                  Ir al panel
                </Link>
                <button
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                  onClick={() => {
                    localStorage.removeItem("user");
                    setUser(null);
                    router.push("/");
                  }}
                >
                  <LuLogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </PopoverContent>
            </Popover>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Prueba gratuita</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
