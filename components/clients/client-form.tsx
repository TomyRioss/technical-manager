"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Client } from "@/types/client";

const COUNTRY_CODES = [
  { code: "54", label: "🇦🇷 +54" },
  { code: "1", label: "🇺🇸 +1" },
  { code: "34", label: "🇪🇸 +34" },
  { code: "52", label: "🇲🇽 +52" },
  { code: "55", label: "🇧🇷 +55" },
  { code: "56", label: "🇨🇱 +56" },
  { code: "57", label: "🇨🇴 +57" },
  { code: "598", label: "🇺🇾 +598" },
];

function parsePhoneWithPrefix(phone: string): { prefix: string; number: string } {
  if (!phone) return { prefix: "54", number: "" };
  for (const { code } of COUNTRY_CODES) {
    if (phone.startsWith(code)) {
      return { prefix: code, number: phone.slice(code.length) };
    }
  }
  return { prefix: "54", number: phone };
}

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: { name: string; phone: string; email: string; notes: string }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ClientForm({ client, onSubmit, onCancel, loading }: ClientFormProps) {
  const parsed = parsePhoneWithPrefix(client?.phone ?? "");
  const [name, setName] = useState(client?.name ?? "");
  const [countryCode, setCountryCode] = useState(parsed.prefix);
  const [phone, setPhone] = useState(parsed.number);
  const [email, setEmail] = useState(client?.email ?? "");
  const [notes, setNotes] = useState(client?.notes ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const fullPhone = phone.trim() ? `${countryCode}${phone.trim().replace(/\D/g, "")}` : "";
    await onSubmit({ name: name.trim(), phone: fullPhone, email: email.trim(), notes: notes.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del cliente"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <div className="flex gap-2">
          <Select value={countryCode} onValueChange={setCountryCode}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_CODES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Número sin prefijo"
            className="flex-1"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas sobre el cliente"
          rows={3}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? "Guardando..." : client ? "Actualizar" : "Crear Cliente"}
        </Button>
      </div>
    </form>
  );
}
