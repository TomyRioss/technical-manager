"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Action = "create" | "join";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [action, setAction] = useState<Action>("create");
  const [storeName, setStoreName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          action,
          storeName: action === "create" ? storeName : undefined,
          inviteCode: action === "join" ? inviteCode : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      router.push(data.user.role === "OWNER" ? "/onboarding" : "/dashboard");
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Logo panel - izquierda */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-neutral-900">
        <Image src="/tipologo.png" alt="Koldesk" width={360} height={96} className="invert" />
      </div>

      {/* Form panel - derecha */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <Image
            src="/tipologo.png"
            alt="KOLDESK"
            width={160}
            height={40}
            className="mx-auto lg:hidden"
          />
          <CardTitle className="text-2xl font-bold tracking-tight">
            Crear cuenta
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Registrate para empezar a usar Koldesk
          </p>
          <p className="text-sm text-muted-foreground">
            Registrarte ahora te permitira utilizar nuestra prueba gratuita, para activar todas las funcionalidades habla con nuestro{" "}
            <Link href="/contact" className="underline font-medium text-primary">
              equipo de ventas
            </Link>
            .
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Selector de acción */}
            <div className="space-y-3 pt-2">
              <Label>¿Qué querés hacer?</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAction("create")}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    action === "create"
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  )}
                >
                  Crear mi tienda
                </button>
                <button
                  type="button"
                  onClick={() => setAction("join")}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    action === "join"
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  )}
                >
                  Unirme a una tienda
                </button>
              </div>
            </div>

            {action === "create" && (
              <div className="space-y-2">
                <Label htmlFor="storeName">Nombre de tu tienda</Label>
                <Input
                  id="storeName"
                  placeholder="Ej: Celulares Express"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                />
              </div>
            )}

            {action === "join" && (
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Código de invitación</Label>
                <Input
                  id="inviteCode"
                  placeholder="Ej: celulares-express"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creando cuenta..." : "Registrarse"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tenés cuenta?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Iniciar sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
