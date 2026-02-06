import Image from "next/image";
import { QrCode, BarChart3, ShoppingBag } from "lucide-react";

const highlights = [
  {
    icon: QrCode,
    title: "Seguimiento de órdenes para clientes",
    description:
      "Tus clientes pueden ver el estado de su reparación en tiempo real. Compartí el link o QR y reducí llamadas de consulta.",
    items: [
      "Página pública con tu marca",
      "Estados en tiempo real",
      "QR para compartir",
      "Sin apps que instalar",
    ],
    image:
      "https://images.pexels.com/photos/4065890/pexels-photo-4065890.jpeg?auto=compress&cs=tinysrgb&w=800",
    imageAlt: "Cliente viendo estado de reparación en celular",
  },
  {
    icon: BarChart3,
    title: "Dashboard de estadísticas",
    description:
      "Visualizá las métricas clave de tu negocio: ventas, reparaciones entregadas, productos con bajo stock y más.",
    items: [
      "Ventas del mes",
      "Comparativa con período anterior",
      "Productos con bajo stock",
      "Órdenes entregadas",
    ],
    image:
      "https://images.pexels.com/photos/7109314/pexels-photo-7109314.jpeg?auto=compress&cs=tinysrgb&w=800",
    imageAlt: "Dashboard con gráficos de estadísticas",
  },
  {
    icon: ShoppingBag,
    title: "E-commerce integrado",
    description:
      "Mostrá tu catálogo de productos online. Tus clientes pueden ver lo que tenés disponible sin necesidad de llamar.",
    items: [
      "Catálogo público",
      "Filtros por categoría",
      "Búsqueda de productos",
      "Integrado con tu stock",
    ],
    image:
      "https://images.pexels.com/photos/6667686/pexels-photo-6667686.jpeg?auto=compress&cs=tinysrgb&w=800",
    imageAlt: "Persona viendo tienda online",
  },
];

export function FeatureHighlights() {
  return (
    <section className="py-16 px-4 bg-neutral-50 md:py-24">
      <div className="max-w-7xl mx-auto space-y-24">
        {highlights.map((highlight, index) => (
          <div
            key={highlight.title}
            className={`grid md:grid-cols-2 gap-12 items-center ${
              index % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* Texto */}
            <div
              className={`space-y-6 ${index % 2 === 1 ? "md:order-2" : ""}`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <highlight.icon className="h-4 w-4" />
                Funcionalidad
              </div>
              <h3 className="text-2xl font-bold md:text-3xl">
                {highlight.title}
              </h3>
              <p className="text-neutral-600 text-lg">{highlight.description}</p>
              <ul className="space-y-3">
                {highlight.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-neutral-700"
                  >
                    <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Imagen */}
            <div
              className={`relative aspect-[4/3] rounded-xl overflow-hidden shadow-xl ${
                index % 2 === 1 ? "md:order-1" : ""
              }`}
            >
              <Image
                src={highlight.image}
                alt={highlight.imageAlt}
                fill
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
