"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboard } from "@/contexts/dashboard-context";
import type { NoteType } from "@/types/work-order";

interface NoteFormProps {
  orderId: string;
  onNoteAdded: () => void;
}

export function NoteForm({ orderId, onNoteAdded }: NoteFormProps) {
  const { userId } = useDashboard();
  const [content, setContent] = useState("");
  const [type, setType] = useState<NoteType>("INTERNAL");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    const res = await fetch(`/api/work-orders/${orderId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim(), type, authorId: userId }),
    });
    if (res.ok) {
      setContent("");
      onNoteAdded();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Escribir nota..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />
      <div className="flex items-center justify-between">
        <Select value={type} onValueChange={(v) => setType(v as NoteType)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INTERNAL">Interna</SelectItem>
            <SelectItem value="TECHNICIAN">Técnico</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={saving || !content.trim()}>
          {saving ? "Guardando..." : "Agregar Nota"}
        </Button>
      </div>
    </form>
  );
}
