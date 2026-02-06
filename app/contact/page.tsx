"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [wantCall, setWantCall] = useState(true);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-16 pt-24 flex-1">
        <section className="max-w-xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Contacto
            </h1>
            <p className="text-lg text-muted-foreground">
              Elegí cómo preferís comunicarte con nosotros
            </p>
          </div>

          {/* Toggle Segmentado */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-lg bg-neutral-200 p-1">
              <button
                type="button"
                onClick={() => setWantCall(true)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  wantCall
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                Quiero que me llamen
              </button>
              <button
                type="button"
                onClick={() => setWantCall(false)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  !wantCall
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                Quiero llamar
              </button>
            </div>
          </div>

          {wantCall ? (
            <Card>
              <CardHeader>
                <CardTitle>Dejanos tus datos</CardTitle>
                <CardDescription>
                  Completá el formulario y nos comunicamos con vos en menos de 24hs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" placeholder="Tu nombre" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" type="tel" placeholder="+54 11 1234-5678" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="tu@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje (opcional)</Label>
                    <Textarea id="message" placeholder="Contanos sobre tu negocio o qué necesitás..." />
                  </div>
                  <Button type="submit" className="w-full">
                    Enviar
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Nuestros datos de contacto</CardTitle>
                <CardDescription>
                  Comunicate con nosotros por el medio que prefieras
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <a
                  href="https://wa.me/5491134083140?text=Hola,%20quiero%20información%20sobre%20Koldesk."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-neutral-100 transition-colors"
                >
                  <MessageSquare className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-muted-foreground">+54 11 3408-3140</p>
                  </div>
                </a>

                <a
                  href="tel:+5491134083140"
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-neutral-100 transition-colors"
                >
                  <Phone className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">Teléfono</p>
                    <p className="text-muted-foreground">+54 11 3408-3140</p>
                  </div>
                </a>

              </CardContent>
            </Card>
          )}
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} Koldesk. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
