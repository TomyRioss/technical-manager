"use client";

import { Badge } from "@/components/ui/badge";
import type { OrderNote } from "@/types/work-order";

interface NoteCardProps {
  note: OrderNote;
}

export function NoteCard({ note }: NoteCardProps) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{note.author?.name ?? "—"}</span>
          <Badge variant="outline" className="text-xs">
            {note.type === "INTERNAL" ? "Interna" : "Técnico"}
          </Badge>
        </div>
        <span className="text-xs text-neutral-500">
          {new Date(note.createdAt).toLocaleString("es-AR")}
        </span>
      </div>
      <p className="text-sm text-neutral-700 whitespace-pre-wrap">{note.content}</p>
    </div>
  );
}
