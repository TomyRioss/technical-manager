"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PriceInput } from "@/components/ui/price-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeviceModelInput } from "./device-model-input";
import { FaultTagSelector } from "./fault-tag-selector";
import { useDashboard } from "@/contexts/dashboard-context";
import type { WorkOrder } from "@/types/work-order";

interface TechnicianOption {
  id: string;
  name: string;
}

interface OrderEditModalProps {
  order: WorkOrder;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function OrderEditModal({ order, open, onClose, onSaved }: OrderEditModalProps) {
  const { storeId } = useDashboard();

  const [deviceModel, setDeviceModel] = useState(order.deviceModel);
  const [reportedFault, setReportedFault] = useState(order.reportedFault);
  const [faultTags, setFaultTags] = useState<string[]>(order.faultTags);
  const [agreedPrice, setAgreedPrice] = useState<number>(order.agreedPrice ?? 0);
  const [technicianId, setTechnicianId] = useState<string>(order.technicianId ?? "");
  const [internalNotes, setInternalNotes] = useState(order.internalNotes ?? "");
  const [warrantyDays, setWarrantyDays] = useState(order.warrantyDays?.toString() ?? "");
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [saving, setSaving] = useState(false);

  const isDelivered = order.status === "ENTREGADO";

  useEffect(() => {
    async function fetchTechnicians() {
      const res = await fetch(`/api/users?storeId=${storeId}`);
      if (res.ok) {
        const data = await res.json();
        setTechnicians(data);
      }
    }
    if (open) fetchTechnicians();
  }, [storeId, open]);

  useEffect(() => {
    if (open) {
      setDeviceModel(order.deviceModel);
      setReportedFault(order.reportedFault);
      setFaultTags(order.faultTags);
      setAgreedPrice(order.agreedPrice ?? 0);
      setTechnicianId(order.technicianId ?? "");
      setInternalNotes(order.internalNotes ?? "");
      setWarrantyDays(order.warrantyDays?.toString() ?? "");
    }
  }, [open, order]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!deviceModel.trim() || !reportedFault.trim()) return;

    setSaving(true);
    const res = await fetch(`/api/work-orders/${order.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceModel: deviceModel.trim(),
        reportedFault: reportedFault.trim(),
        faultTags,
        agreedPrice: agreedPrice || null,
        technicianId: technicianId || null,
        internalNotes: internalNotes.trim() || null,
        ...(!isDelivered && { warrantyDays: warrantyDays ? parseInt(warrantyDays) : null }),
      }),
    });

    if (res.ok) {
      onSaved();
      onClose();
    }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Orden</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DeviceModelInput storeId={storeId} value={deviceModel} onChange={setDeviceModel} />

          <div className="space-y-2">
            <Label htmlFor="editReportedFault">Falla reportada *</Label>
            <Textarea
              id="editReportedFault"
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
              <Label htmlFor="editAgreedPrice">Precio acordado</Label>
              <PriceInput
                id="editAgreedPrice"
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
            <Label htmlFor="editWarrantyDays">Días de garantía</Label>
            <Input
              id="editWarrantyDays"
              type="number"
              min="0"
              placeholder="Ej: 30, 60, 90"
              value={warrantyDays}
              onChange={(e) => setWarrantyDays(e.target.value)}
              disabled={isDelivered}
            />
            {isDelivered && (
              <p className="text-xs text-neutral-500">La garantía no se puede modificar después de entregar</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="editInternalNotes">Notas internas</Label>
            <Textarea
              id="editInternalNotes"
              placeholder="Notas que solo verá el equipo..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !deviceModel.trim() || !reportedFault.trim()}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
