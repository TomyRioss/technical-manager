"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingForm } from "@/components/rating/rating-form";
import { RatingDisplay } from "@/components/rating/rating-display";

export default function RatingPage() {
  const { orderId } = useParams<{ slug: string; orderId: string }>();
  const [existing, setExisting] = useState<{ stars: number; feedback: string | null; createdAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function checkRating() {
      const res = await fetch(`/api/work-orders/${orderId}/rating`);
      if (res.ok) {
        const data = await res.json();
        if (data) setExisting(data);
      }
      setLoading(false);
    }
    checkRating();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-sm text-neutral-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-md px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Valorar Servicio</CardTitle>
          </CardHeader>
          <CardContent>
            {existing || submitted ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-neutral-600">
                  {submitted ? "Gracias por tu valoración." : "Esta orden ya fue valorada."}
                </p>
                {existing && (
                  <RatingDisplay
                    stars={existing.stars}
                    feedback={existing.feedback}
                    createdAt={existing.createdAt}
                  />
                )}
              </div>
            ) : (
              <RatingForm orderId={orderId} onRated={() => setSubmitted(true)} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
