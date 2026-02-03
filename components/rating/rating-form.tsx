"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { LuStar } from "react-icons/lu";

interface RatingFormProps {
  orderId: string;
  onRated: () => void;
}

export function RatingForm({ orderId, onRated }: RatingFormProps) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (stars === 0) return;

    setSaving(true);
    setError(null);

    const res = await fetch(`/api/work-orders/${orderId}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stars, feedback: feedback.trim() }),
    });

    if (res.ok) {
      onRated();
    } else {
      const data = await res.json();
      setError(data.error ?? "Error al enviar valoración");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-1 justify-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setStars(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="p-1"
          >
            <LuStar
              className={cn(
                "h-8 w-8 transition-colors",
                (hover || stars) >= n
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-neutral-300"
              )}
            />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Contanos tu experiencia (opcional)"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={3}
      />
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      <Button type="submit" disabled={saving || stars === 0} className="w-full">
        {saving ? "Enviando..." : "Enviar Valoración"}
      </Button>
    </form>
  );
}
