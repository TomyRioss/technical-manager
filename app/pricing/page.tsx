import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/navbar";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-16 pt-24 flex-1">
        <section className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Precios
          </h1>
          <p className="text-lg text-muted-foreground">
            Para obtener un precio a tu medida con todas las herramientas necesarias contactate con ventas. ¡Respondemos en menos de 24hs!
          </p>
          <Button asChild size="lg">
            <Link href="/contact">
              Contactar ventas
            </Link>
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
