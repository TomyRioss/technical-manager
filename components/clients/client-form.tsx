"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [formMode, setFormMode] = useState<"steps" | "complete">("complete");
  const [step, setStep] = useState(1);
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

  const totalSteps = 3;
  const progressValue = (step / totalSteps) * 100;

  const FormModeSwitch = () => (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Formulario:</span>
      <span className={formMode === "complete" ? "font-medium" : "text-muted-foreground"}>Completo</span>
      <Switch checked={formMode === "steps"} onCheckedChange={(v) => { setFormMode(v ? "steps" : "complete"); setStep(1); }} />
      <span className={formMode === "steps" ? "font-medium" : "text-muted-foreground"}>Pasos</span>
    </div>
  );

  const ProgressBar = () => (
    <div className="w-full max-w-md mt-8">
      <Progress value={progressValue} className="h-2" />
      <p className="text-xs text-muted-foreground text-center mt-1">Paso {step} de {totalSteps}</p>
    </div>
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && step < totalSteps) {
      e.preventDefault();
      if (step === 1 && name.trim()) setStep(2);
      else if (step === 2) setStep(3);
    }
  }

  // Steps mode
  if (formMode === "steps") {
    // Step 1: Nombre
    if (step === 1) {
      return (
        <div>
          <div className="flex justify-end"><FormModeSwitch /></div>
          <div className="flex flex-col items-center justify-center min-h-[40vh] max-w-xl mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-8 text-center">Nombre completo del cliente</h2>
            <div className="w-full" onKeyDown={handleKeyDown}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del cliente"
                autoFocus
                className="text-center"
              />
            </div>
            <div className="flex gap-3 mt-8">
              <Button variant="outline" onClick={onCancel}>Cancelar</Button>
              <Button onClick={() => setStep(2)} disabled={!name.trim()}>
                Continuar <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <ProgressBar />
          </div>
        </div>
      );
    }

    // Step 2: Teléfono + Email
    if (step === 2) {
      return (
        <div>
          <div className="flex justify-end"><FormModeSwitch /></div>
          <div className="flex flex-col items-center justify-center min-h-[40vh] max-w-xl mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-8 text-center">Contacto</h2>
            <div className="w-full space-y-4" onKeyDown={handleKeyDown}>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Número sin prefijo"
                    className="flex-1"
                    autoFocus
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
            </div>
            <div className="flex gap-3 mt-8">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4" /> Volver
              </Button>
              <Button onClick={() => setStep(3)}>
                Continuar <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <ProgressBar />
          </div>
        </div>
      );
    }

    // Step 3: Notas
    return (
      <div>
        <div className="flex justify-end"><FormModeSwitch /></div>
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center min-h-[40vh] max-w-xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-8 text-center">Notas</h2>
        <div className="w-full space-y-2">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas sobre el cliente (opcional)"
            rows={4}
            autoFocus
          />
        </div>
        <div className="flex gap-3 mt-8">
          <Button type="button" variant="outline" onClick={() => setStep(2)}>
            <ChevronLeft className="h-4 w-4" /> Volver
          </Button>
          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? "Guardando..." : client ? "Actualizar" : "Crear Cliente"}
          </Button>
        </div>
        <ProgressBar />
      </form>
      </div>
    );
  }

  // Complete mode (default)
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-end">
        <FormModeSwitch />
      </div>
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
