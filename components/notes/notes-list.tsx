"use client";

import { useState, useEffect, useCallback } from "react";
import { NoteCard } from "./note-card";
import { NoteForm } from "./note-form";
import type { OrderNote } from "@/types/work-order";

interface NotesListProps {
  orderId: string;
  initialNotes?: OrderNote[];
}

export function NotesList({ orderId, initialNotes }: NotesListProps) {
  const [notes, setNotes] = useState<OrderNote[]>(initialNotes ?? []);

  const fetchNotes = useCallback(async () => {
    const res = await fetch(`/api/work-orders/${orderId}/notes`);
    if (res.ok) {
      const data = await res.json();
      setNotes(data);
    }
  }, [orderId]);

  useEffect(() => {
    if (!initialNotes) fetchNotes();
  }, [fetchNotes, initialNotes]);

  return (
    <div className="space-y-4">
      <NoteForm orderId={orderId} onNoteAdded={fetchNotes} />
      {notes.length === 0 ? (
        <p className="text-sm text-neutral-500 py-2">No hay notas.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
