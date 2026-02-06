import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-24 px-4 md:py-32 bg-neutral-900 text-white">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-4xl font-bold md:text-5xl lg:text-6xl">
          Empezá a usar Koldesk hoy
        </h2>
        <p className="text-xl text-neutral-300 md:text-2xl max-w-2xl mx-auto">
          Simplificá la gestión de tu local técnico. Sin compromisos, sin
          tarjeta de crédito.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center pt-4">
          <Button
            asChild
            size="lg"
            className="h-14 px-10 text-lg bg-white text-neutral-900 hover:bg-neutral-100"
          >
            <a href="/register">Empezar gratis</a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-14 px-10 text-lg border-2 border-white text-white bg-transparent hover:bg-white hover:text-neutral-900"
          >
            <a href="/contact">Contactar ventas</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
