import { Navbar } from "@/components/landing/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Plug, MessageSquare, CreditCard, Truck, Mail, BarChart3 } from "lucide-react";

const PLACEHOLDER_APPS = [
  { name: "WhatsApp Business", icon: MessageSquare, category: "Comunicación" },
  { name: "MercadoPago", icon: CreditCard, category: "Pagos" },
  { name: "Stripe", icon: CreditCard, category: "Pagos" },
  { name: "Correo Argentino", icon: Truck, category: "Envíos" },
  { name: "Andreani", icon: Truck, category: "Envíos" },
  { name: "Mailchimp", icon: Mail, category: "Marketing" },
  { name: "Google Analytics", icon: BarChart3, category: "Analíticas" },
  { name: "Meta Pixel", icon: BarChart3, category: "Analíticas" },
];

export default function IntegracionesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="container mx-auto px-4 py-16 pt-24">
        {/* Header */}
        <section className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Integraciones
          </h1>
          <p className="text-lg text-muted-foreground">
            Conecta tu negocio con las herramientas que ya usas.
          </p>
        </section>

        {/* Banner Próximamente */}
        <section className="max-w-4xl mx-auto mb-16">
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
              <Plug className="h-10 w-10 text-neutral-400" />
            </div>
            <h2 className="mt-8 text-4xl font-bold text-neutral-900">Próximamente</h2>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              Estamos trabajando para añadir las mejores integraciones al sistema.
              Pronto podrás conectar pasarelas de pago, servicios de envío, herramientas
              de marketing y mucho más.
            </p>
          </div>
        </section>

        {/* Catálogo de apps */}
        <section className="max-w-5xl mx-auto">
          <h3 className="mb-6 text-sm font-semibold text-neutral-500 uppercase tracking-wide text-center">
            Integraciones planeadas
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLACEHOLDER_APPS.map((app) => (
              <Card key={app.name} className="opacity-50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                    <app.icon className="h-6 w-6 text-neutral-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-neutral-700">{app.name}</p>
                    <p className="text-sm text-neutral-400">{app.category}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} Koldesk. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
