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

interface TechnicianOption {
  id: string;
  name: string;
}

export function OrderForm() {
  const { storeId, userId } = useDashboard();
  const router = useRouter();

  const [clientId, setClientId] = useState<string | null>(null);
  const [deviceModel, setDeviceModel] = useState("");
  const [reportedFault, setReportedFault] = useState("");
  const [faultTags, setFaultTags] = useState<string[]>([]);
  const [agreedPrice, setAgreedPrice] = useState<number>(0);
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
    if (!clientId || !deviceModel.trim() || !reportedFault.trim()) return;

    setSaving(true);
    const res = await fetch("/api/work-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceModel: deviceModel.trim(),
        reportedFault: reportedFault.trim(),
        faultTags,
        agreedPrice: agreedPrice || null,
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

      // Subir fotos del equipo
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <ClientSelector
        storeId={storeId}
        selectedId={clientId}
        onSelect={(c) => setClientId(c?.id ?? null)}
      />

      <DeviceModelInput storeId={storeId} value={deviceModel} onChange={setDeviceModel} />

      <div className="space-y-2">
        <Label htmlFor="reportedFault">Falla reportada *</Label>
        <Textarea
          id="reportedFault"
          placeholder="Descripción de la falla..."
          value={reportedFault}
          onChange={(e) => setReportedFault(e.target.value)}
          rows={3}
          required
        />
      </div>

      <FaultTagSelector selected={faultTags} onChange={setFaultTags} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="agreedPrice">Precio acordado</Label>
          <PriceInput
            id="agreedPrice"
            value={agreedPrice}
            onChange={setAgreedPrice}
            placeholder="$0"
          />
        </div>
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

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/ordenes")}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={saving || !clientId || !deviceModel.trim() || !reportedFault.trim()}
        >
          {saving ? (devicePhotos.length > 0 ? "Subiendo fotos..." : "Creando...") : "Crear Orden"}
        </Button>
      </div>
    </form>
  );
}
