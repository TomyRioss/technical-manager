"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { cn } from "@/lib/utils";
import { sections, allItems } from "./data";
import { ArticleContent } from "./article-content";

export default function AyudaPage() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedArticle = allItems[selectedIndex];

  // Calcular índice global para sidebar desktop
  let globalIndex = 0;

  function handleSectionClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      {/* Mobile */}
      <main className="md:hidden container mx-auto px-4 py-16 pt-24 flex-1">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Ayuda</h1>
          <p className="text-lg text-muted-foreground">
            Preguntas frecuentes y guías para usar la plataforma
          </p>
        </div>
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.items.map((item) => {
                  const idx = allItems.indexOf(item);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      className={cn(
                        "w-full text-left rounded-lg border p-4 text-sm transition-colors",
                        selectedIndex === idx
                          ? "border-neutral-900 bg-white font-medium"
                          : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
                      )}
                    >
                      <p className="font-medium text-neutral-900">
                        {item.label}
                      </p>
                      {selectedIndex === idx && (
                        <div className="mt-4">
                          <ArticleContent
                            title={item.label}
                            sections={item.sections}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Desktop: sidebar izq + contenido central + sidebar derecho */}
      <div className="hidden md:flex flex-1 pt-16">
        {/* Sidebar izquierdo - Navegación */}
        <aside className="w-64 lg:w-72 shrink-0 border-r border-neutral-200 p-6 pt-8 overflow-y-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6"
          >
            <ArrowLeft className="size-4" />
            Volver
          </button>
          {sections.map((section) => {
            const sectionItems = section.items.map((item) => {
              const idx = globalIndex;
              globalIndex++;
              return { ...item, idx };
            });

            return (
              <div key={section.title} className="mb-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                  {section.title}
                </h2>
                <nav className="flex flex-col gap-1">
                  {sectionItems.map(({ label, idx }) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      className={cn(
                        "w-full text-left rounded-md px-3 py-2 text-sm transition-colors",
                        selectedIndex === idx
                          ? "bg-blue-600 text-white font-medium"
                          : "text-neutral-600 hover:bg-neutral-100"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
              </div>
            );
          })}
        </aside>

        {/* Contenido central */}
        <div
          id="article-scroll-container"
          className="flex-1 min-w-0 overflow-y-auto"
        >
          <div className="max-w-3xl mx-auto px-8 lg:px-16 py-8">
            <div>
              <ArticleContent
                title={selectedArticle.label}
                sections={selectedArticle.sections}
              />
            </div>
          </div>
        </div>

        {/* Sidebar derecho - En esta página */}
        <aside className="hidden lg:block w-56 xl:w-64 shrink-0 border-l border-neutral-200 p-6 pt-8 overflow-y-auto">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
            En esta página
          </h3>
          <nav className="flex flex-col gap-1">
            {selectedArticle.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(e) => handleSectionClick(e, section.id)}
                className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors py-1.5 pl-3 border-l-2 border-transparent hover:border-neutral-300"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </aside>
      </div>

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
