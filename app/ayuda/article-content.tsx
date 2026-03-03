"use client";

import { useEffect } from "react";
import type { ArticleSection } from "./data";

interface ArticleContentProps {
  title: string;
  sections: ArticleSection[];
}

export function ArticleContent({ title, sections }: ArticleContentProps) {
  // Scroll al top cuando cambia el artículo
  useEffect(() => {
    const container = document.getElementById("article-scroll-container");
    if (container) container.scrollTop = 0;
  }, [title]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-8">{title}</h2>
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-3">
              {section.title}
            </h3>
            <p className="text-neutral-600 leading-relaxed">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
