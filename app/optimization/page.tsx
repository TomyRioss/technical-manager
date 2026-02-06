import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/landing/navbar";
import { Receipt, BarChart3, Zap } from "lucide-react";

export default function OptimizationPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="container mx-auto px-4 py-16 pt-24">
        {/* Sección 1: Info principal */}
        <section className="space-y-12 mb-16">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Optimización
            </h1>
            <p className="text-lg text-muted-foreground">
              Optimiza tus procesos, mejora tu eficiencia y abarata costos para tener las mejores ganancias posibles de tu negocio.
            </p>
          </div>

          {/* Row 1: Texto | Imagen - Buscador para clientes */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Buscador para Clientes</h2>
              <p className="text-muted-foreground leading-relaxed">
                Encontrá cualquier cliente en segundos. Buscá por nombre, teléfono, email o
                cualquier dato que tengas. Accedé al historial completo de compras, reparaciones
                y contactos con un solo click.
              </p>
            </div>
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Búsqueda de clientes"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Row 2: Imagen | Texto - Seguimiento automático */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden order-2 md:order-1">
              <Image
                src="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Seguimiento de clientes"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-2xl font-semibold mb-4">Seguimiento Automático de Clientes</h2>
              <p className="text-muted-foreground leading-relaxed">
                El sistema registra cada interacción automáticamente. Sabé cuándo fue la última
                visita, qué compró y cuánto gastó cada cliente. Identificá a tus mejores clientes
                y a los que no vuelven hace tiempo para reactivarlos.
              </p>
            </div>
          </div>

          {/* Row 3: Texto | Imagen - Gestión de inventario */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Gestión de Inventario</h2>
              <p className="text-muted-foreground leading-relaxed">
                Controlá tu stock en tiempo real. Recibí alertas cuando un producto está por
                agotarse, registrá entradas y salidas con facilidad, y nunca más pierdas una
                venta por falta de stock.
              </p>
            </div>
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Gestión de inventario"
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
                <Receipt className="h-8 w-8 text-neutral-900 mb-2" />
                <CardTitle>Generación de Recibos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Generá recibos profesionales automáticamente con cada venta. Incluyen el detalle
                  de productos, precios, métodos de pago y datos de tu negocio. Envialos por
                  WhatsApp o email.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-200">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-neutral-900 mb-2" />
                <CardTitle>Estadísticas Generales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Visualizá el rendimiento de tu negocio con gráficos claros. Ventas por día,
                  semana o mes, productos más vendidos, clientes más frecuentes y tendencias
                  de crecimiento. Tomá decisiones basadas en datos reales.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-200">
              <CardHeader>
                <Zap className="h-8 w-8 text-neutral-900 mb-2" />
                <div className="flex items-center gap-2">
                  <CardTitle>Automatización de Tareas</CardTitle>
                  <Badge variant="secondary" className="text-sm px-3 py-1">Integración+</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Ahorrá horas de trabajo manual. Recordatorios automáticos para clientes,
                  actualización de stock con cada venta, reportes diarios enviados a tu email
                  y mucho más. Enfocate en vender, el sistema hace el resto.
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
