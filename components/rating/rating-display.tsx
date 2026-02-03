"use client";

import { LuStar } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  stars: number;
  feedback: string | null;
  createdAt?: string;
}

export function RatingDisplay({ stars, feedback, createdAt }: RatingDisplayProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <LuStar
            key={n}
            className={cn(
              "h-5 w-5",
              stars >= n ? "fill-yellow-400 text-yellow-400" : "text-neutral-300"
            )}
          />
        ))}
      </div>
      {feedback && (
        <p className="text-sm text-neutral-700">{feedback}</p>
      )}
      {createdAt && (
        <p className="text-xs text-neutral-500">
          {new Date(createdAt).toLocaleDateString("es-AR")}
        </p>
      )}
    </div>
  );
}
