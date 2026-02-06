import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/landing/navbar";
import { Activity, Megaphone, Globe } from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="container mx-auto px-4 py-16 pt-24">
        {/* Sección 1: Info principal */}
        <section className="space-y-12 mb-16">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Marketing
            </h1>
            <p className="text-lg text-muted-foreground">
              Conseguí más clientes, vende más y date a conocer.
            </p>
          </div>

          {/* Row 1: Texto | Imagen */}
          <div className="max-w-5xl mx-auto max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-semibold mb-4">¿Cómo funciona?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Podes sumar cada cliente en menos de 3 minutos, añadiendolos a tú directorio
                personal con su información de contacto, vas a poder organizar campañas de
                Marketing para enviarles a todos ofertas exclusivas en tus servicios y productos.
                Esto incluye Email Marketing.
              </p>
            </div>
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="https://images.pexels.com/photos/6755091/pexels-photo-6755091.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Técnico reparando un celular"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Row 2: Imagen | Texto */}
          <div className="max-w-5xl mx-auto max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden order-2 md:order-1">
              <Image
                src="/directorio.png"
                alt="Directorio de clientes"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-2xl font-semibold mb-4">Directorio de clientes</h2>
              <p className="text-muted-foreground leading-relaxed">
                Tendrás un directorio de clientes para sumar clientes en menos de 3 minutos,
                una vez acumulados clientes podrás enviarles promociones exclusivas para
                productos o servicios.
              </p>
            </div>
          </div>

          {/* Row 3: Texto | Imagen */}
          <div className="max-w-5xl mx-auto max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Seguimiento en un click</h2>
              <p className="text-muted-foreground leading-relaxed">
                Podrás comunicarte con tus clientes en un solo click con herramientas
                integradas en el directorio de cliente.
              </p>
            </div>
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="https://images.pexels.com/photos/3850512/pexels-photo-3850512.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Servicio técnico de smartphones"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Sección 2: 3 Cards */}
        <section className="mb-16 py-16 px-4 bg-neutral-900" style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", width: "100vw" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-white border-neutral-200">
              <CardHeader>
                <Activity className="h-8 w-8 text-neutral-900 mb-2" />
                <CardTitle>Seguimiento dinámico automático</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Cada visita, cada compra y cada interacción de tus clientes queda registrada
                  de forma automática. Vas a poder ver el historial completo de gastos, frecuencia
                  de visitas y preferencias de cada cliente sin cargar nada manualmente.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-200">
              <CardHeader>
                <Megaphone className="h-8 w-8 text-neutral-900 mb-2" />
                <CardTitle>Campañas de Marketing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Creá y lanzá campañas de email marketing en menos de 5 minutos. Seleccioná
                  a todos tus clientes o segmentalos por frecuencia de compra, y enviá
                  promociones, descuentos y novedades directamente a sus casillas.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-200">
              <CardHeader>
                <Globe className="h-8 w-8 text-neutral-900 mb-2" />
                <CardTitle>Presencia Digital</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Obtené tu propia página web con catálogo de productos y servicios incluido.
                  Tus clientes van a poder ver lo que ofrecés, consultar precios y contactarte
                  directamente desde cualquier dispositivo.
                </p>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* Sección 3: CTA */}
        <section className="text-center max-w-2xl mx-auto">
          <p className="text-lg text-muted-foreground mb-6">
            Obtené ahora estos y muchos más beneficios adquiriendo hablando con nosotros.
          </p>
          <Button asChild size="lg">
            <Link href="#contacto">Contactanos</Link>
          </Button>
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
