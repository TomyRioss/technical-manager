import { ClipboardList, Package, Users } from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "Órdenes de Reparación",
    description:
      "Seguí cada reparación con estados claros, asignación a técnicos, fotos del equipo y sistema de garantía integrado.",
    items: [
      "Estados de reparación",
      "Asignación a técnicos",
      "Fotos del equipo",
      "Seguimiento de garantía",
    ],
  },
  {
    icon: Package,
    title: "Inventario y POS",
    description:
      "Controlá tu stock con SKU, gestioná múltiples métodos de pago y generá recibos profesionales.",
    items: [
      "Control de stock",
      "Múltiples métodos de pago",
      "Recibos profesionales",
      "Alertas de bajo stock",
    ],
  },
  {
    icon: Users,
    title: "CRM de Clientes",
    description:
      "Conocé a tus clientes con tags automáticos, historial de visitas y seguimiento de gastos.",
    items: [
      "Tags: VIP, nuevo",
      "Historial de reparaciones",
      "Seguimiento de gastos",
      "Notas internas",
    ],
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-16 px-4 md:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl font-bold md:text-4xl">
            Todo lo que necesitás para tu local
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Herramientas diseñadas específicamente para locales de reparación
            técnica.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border bg-white hover:shadow-lg transition-shadow"
            >
              <feature.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-neutral-600 mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-neutral-600"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
