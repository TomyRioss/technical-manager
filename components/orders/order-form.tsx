"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PriceInput } from "@/components/ui/price-input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientSelector } from "./client-selector";
import { DeviceModelInput } from "./device-model-input";
import { DevicePhotosInput } from "./device-photos-input";
import { FaultTagSelector } from "./fault-tag-selector";
import { useDashboard } from "@/contexts/dashboard-context";
import { compressImage } from "@/lib/image-compressor";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TechnicianOption {
  id: string;
  name: string;
}

export function OrderForm() {
  const { storeId, userId } = useDashboard();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [reportedFault, setReportedFault] = useState("");
  const [faultTags, setFaultTags] = useState<string[]>([]);
  const [paidPrice, setPaidPrice] = useState<number>(0);
  const [technicianId, setTechnicianId] = useState<string>("");
  const [internalNotes, setInternalNotes] = useState("");
  const [warrantyDays, setWarrantyDays] = useState("");
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [devicePhotos, setDevicePhotos] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchTechnicians() {
      const res = await fetch(`/api/users?storeId=${storeId}`);
      if (res.ok) {
        const data = await res.json();
        setTechnicians(data);
      }
    }
    fetchTechnicians();
  }, [storeId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !deviceModel.trim() || !reportedFault.trim() || paidPrice <= 0) return;

    setSaving(true);
    const res = await fetch("/api/work-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceModel: deviceModel.trim(),
        reportedFault: reportedFault.trim(),
        faultTags,
        agreedPrice: paidPrice,
        clientId,
        technicianId: technicianId || null,
        createdById: userId,
        storeId,
        internalNotes: internalNotes.trim() || null,
        warrantyDays: warrantyDays ? parseInt(warrantyDays) : null,
      }),
    });

    if (res.ok) {
      const order = await res.json();

      for (const photo of devicePhotos) {
        try {
          const compressed = await compressImage(photo);
          const formData = new FormData();
          formData.append("file", compressed);
          formData.append("orderId", order.id);

          const uploadRes = await fetch("/api/upload/order-photos", {
            method: "POST",
            body: formData,
          });

          if (uploadRes.ok) {
            const { url } = await uploadRes.json();
            await fetch(`/api/work-orders/${order.id}/photos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url, caption: null }),
            });
          }
        } catch {
          // Continuar con las demás fotos si una falla
        }
      }

      router.push(`/dashboard/ordenes/${order.id}`);
    }
    setSaving(false);
  }

  function canContinue() {
    switch (step) {
      case 1: return !!clientId;
      case 2: return deviceModel.trim().length > 0;
      case 3: return reportedFault.trim().length > 0;
      case 4: return paidPrice > 0;
      default: return false;
    }
  }

  function handleContinue() {
    if (canContinue() && step < 5) {
      setStep(step + 1);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && step < 5) {
      e.preventDefault();
      handleContinue();
    }
  }

  const progressValue = (step / 5) * 100;

  const ProgressBar = () => (
    <div className="w-full max-w-md mt-8">
      <Progress value={progressValue} className="h-2" />
      <p className="text-xs text-muted-foreground text-center mt-1">Paso {step} de 5</p>
    </div>
  );

  // Step 1: Cliente
  if (step === 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-8 text-center">Seleccionar Cliente</h2>
        <div className="w-full">
          <ClientSelector
            storeId={storeId}
            selectedId={clientId}
            onSelect={(c) => {
              setClientId(c?.id ?? null);
              setClientName(c?.name ?? "");
            }}
          />
        </div>
        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/ordenes")}
          >
            Cancelar
          </Button>
          <Button onClick={handleContinue} disabled={!canContinue()}>
            Continuar <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <ProgressBar />
      </div>
    );
  }

  // Step 2: Modelo de equipo
  if (step === 2) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-8 text-center">Modelo del Equipo</h2>
        <div className="w-full" onKeyDown={handleKeyDown}>
          <DeviceModelInput storeId={storeId} value={deviceModel} onChange={setDeviceModel} />
        </div>
        <div className="flex gap-3 mt-8">
          <Button variant="outline" onClick={() => setStep(1)}>
            <ChevronLeft className="h-4 w-4" /> Volver
          </Button>
          <Button onClick={handleContinue} disabled={!canContinue()}>
            Continuar <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <ProgressBar />
      </div>
    );
  }

  // Step 3: Falla reportada
  if (step === 3) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-8 text-center">Falla Reportada</h2>
        <div className="w-full space-y-2">
          <Textarea
            id="reportedFault"
            placeholder="Descripción de la falla..."
            value={reportedFault}
            onChange={(e) => setReportedFault(e.target.value)}
            rows={4}
            autoFocus
          />
        </div>
        <div className="flex gap-3 mt-8">
          <Button variant="outline" onClick={() => setStep(2)}>
            <ChevronLeft className="h-4 w-4" /> Volver
          </Button>
          <Button onClick={handleContinue} disabled={!canContinue()}>
            Continuar <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <ProgressBar />
      </div>
    );
  }

  // Step 4: Precio pagado
  if (step === 4) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-8 text-center">Precio Pagado</h2>
        <div className="w-full max-w-xs" onKeyDown={handleKeyDown}>
          <PriceInput
            id="paidPrice"
            value={paidPrice}
            onChange={setPaidPrice}
            placeholder="$0"
          />
        </div>
        <div className="flex gap-3 mt-8">
          <Button variant="outline" onClick={() => setStep(3)}>
            <ChevronLeft className="h-4 w-4" /> Volver
          </Button>
          <Button onClick={handleContinue} disabled={!canContinue()}>
            Continuar <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <ProgressBar />
      </div>
    );
  }

  // Step 5: Resumen + Opcionales
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Resumen de datos obligatorios */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="font-semibold text-lg">Resumen de la orden</h3>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex justify-between items-center col-span-2 border-b pb-2">
            <div>
              <span className="text-muted-foreground">Cliente:</span>
              <span className="ml-2 font-medium">{clientName}</span>
            </div>
            <button type="button" onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground">
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          <div className="flex justify-between items-center col-span-2 border-b pb-2">
            <div>
              <span className="text-muted-foreground">Modelo:</span>
              <span className="ml-2 font-medium">{deviceModel}</span>
            </div>
            <button type="button" onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground">
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          <div className="flex justify-between items-center col-span-2 border-b pb-2">
            <div className="flex-1">
              <span className="text-muted-foreground">Falla:</span>
              <span className="ml-2 font-medium">{reportedFault}</span>
            </div>
            <button type="button" onClick={() => setStep(3)} className="text-muted-foreground hover:text-foreground">
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          <div className="flex justify-between items-center col-span-2">
            <div>
              <span className="text-muted-foreground">Precio pagado:</span>
              <span className="ml-2 font-medium">${paidPrice.toLocaleString()}</span>
            </div>
            <button type="button" onClick={() => setStep(4)} className="text-muted-foreground hover:text-foreground">
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Campos opcionales */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Campos opcionales</h3>

        <FaultTagSelector selected={faultTags} onChange={setFaultTags} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Técnico asignado</Label>
            <Select value={technicianId} onValueChange={setTechnicianId}>
              <SelectTrigger>
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="warrantyDays">Días de garantía</Label>
            <Input
              id="warrantyDays"
              type="number"
              min="0"
              placeholder="Ej: 30, 60, 90"
              value={warrantyDays}
              onChange={(e) => setWarrantyDays(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="internalNotes">Notas internas</Label>
          <Textarea
            id="internalNotes"
            placeholder="Notas que solo verá el equipo..."
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={2}
          />
        </div>

        <DevicePhotosInput photos={devicePhotos} onChange={setDevicePhotos} />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={() => setStep(4)} disabled={saving}>
          <ChevronLeft className="h-4 w-4" /> Volver
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (devicePhotos.length > 0 ? "Subiendo fotos..." : "Creando...") : "Crear Orden"}
        </Button>
      </div>

      <div className="w-full mt-6">
        <Progress value={100} className="h-2" />
        <p className="text-xs text-muted-foreground text-center mt-1">Paso 5 de 5</p>
      </div>
    </form>
  );
}
