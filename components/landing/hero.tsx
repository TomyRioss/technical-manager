import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="min-h-screen w-full flex items-center px-4 pt-16">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Texto */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Software integral para locales técnicos
            </h1>
            <p className="text-lg text-neutral-600 md:text-xl">
              Gestioná reparaciones, inventario y ventas en un solo lugar.
              Ahorrá tiempo, vendé mejor y aumentá tus ganancias.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <a href="/register">Empezar gratis</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a
                  href="https://wa.me/5491134083140?text=Hola,%20quiero%20ver%20una%20demo%20de%20Koldesk."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver demo
                </a>
              </Button>
            </div>
          </div>

          {/* Imagen */}
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl">
            <Image
              src="https://images.pexels.com/photos/6755091/pexels-photo-6755091.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Técnico reparando celular"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
