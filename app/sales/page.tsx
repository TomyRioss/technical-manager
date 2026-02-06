import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/landing/navbar";
import { ShoppingCart, Globe, MessageSquare } from "lucide-react";

export default function SalesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="container mx-auto px-4 py-16 pt-24">
        {/* Sección 1: Info principal */}
        <section className="space-y-12 mb-16">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Ventas
            </h1>
            <p className="text-lg text-muted-foreground">
              Herramientas para vender más, cobrar sin complicaciones y obtener más ventas.
            </p>
          </div>

          {/* Row 1: Texto | Imagen - POS */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Punto de Venta (POS)</h2>
              <p className="text-muted-foreground leading-relaxed">
                Un sistema de punto de venta completo y fácil de usar. Procesá ventas en segundos,
                aceptá múltiples métodos de pago y generá tickets automáticamente. Todo desde
                cualquier dispositivo, sin necesidad de equipos costosos.
              </p>
            </div>
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Sistema de punto de venta"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Row 2: Imagen | Texto - Catálogo Web */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden order-2 md:order-1">
              <Image
                src="https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Catálogo de productos online"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-2xl font-semibold mb-4">Catálogo Web de Productos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Mostrá tus productos y servicios en una tienda online profesional. Tus clientes
                pueden ver precios, descripciones y fotos desde cualquier lugar. Compartí el
                link por WhatsApp o redes sociales y empezá a vender 24/7.
              </p>
            </div>
          </div>

          {/* Row 3: Texto | Imagen - Chatbot */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-semibold">Chatbot Inteligente</h2>
                <Badge variant="secondary" className="text-sm px-3 py-1">Integración+</Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Atendé consultas de clientes las 24 horas del día con un chatbot que responde
                preguntas frecuentes, muestra productos disponibles y agenda citas. Nunca más
                pierdas una venta por no responder a tiempo.
              </p>
            </div>
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Chatbot de atención al cliente"
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
                <ShoppingCart className="h-8 w-8 text-neutral-900 mb-2" />
                <CardTitle>Ventas sin fricción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Procesá ventas en menos de 30 segundos. Buscá productos por nombre o código,
                  agregá al carrito con un click, y cobrá con efectivo, tarjeta, transferencia
                  o cualquier método que uses. Sin complicaciones ni pasos innecesarios.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-200">
              <CardHeader>
                <Globe className="h-8 w-8 text-neutral-900 mb-2" />
                <CardTitle>Vendé online sin esfuerzo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Tu catálogo se actualiza automáticamente con los productos de tu inventario.
                  Cada vez que agregás un producto, ya está disponible en tu tienda online.
                  Tus clientes pueden ver stock en tiempo real y hacer pedidos directamente.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-200">
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-neutral-900 mb-2" />
                <div className="flex items-center gap-2">
                  <CardTitle>Atención automática 24/7</CardTitle>
                  <Badge variant="secondary" className="text-sm px-3 py-1">Integración+</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  El chatbot responde consultas sobre precios, disponibilidad y horarios
                  mientras dormís. Cuando un cliente necesita atención humana, te notifica
                  al instante. Capturá leads y cerrá ventas incluso fuera de horario.
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
