"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientSelector } from "@/components/orders/client-selector";
import { DeviceModelInput } from "@/components/orders/device-model-input";
import { FaultTagSelector } from "@/components/orders/fault-tag-selector";
import { PriceInput } from "@/components/ui/price-input";
import type { Product } from "@/types/product";
import type { WorkOrderFormData } from "@/types/pos";

interface Technician {
  id: string;
  name: string;
}

interface PosWorkOrderModalProps {
  product: Product;
  storeId: string;
  branchId: string;
  onConfirm: (data: WorkOrderFormData) => void;
  onCancel: () => void;
}

export function PosWorkOrderModal({
  product,
  storeId,
  branchId,
  onConfirm,
  onCancel,
}: PosWorkOrderModalProps) {
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [reportedFault, setReportedFault] = useState("");
  const [faultTags, setFaultTags] = useState<string[]>([]);
  const [agreedPrice, setAgreedPrice] = useState(product.price);
  const [partsCost, setPartsCost] = useState(0);
  const [technicianId, setTechnicianId] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [warrantyDays, setWarrantyDays] = useState("");
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/users?storeId=${storeId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTechnicians(data);
      })
      .catch(() => {});
  }, [storeId]);

  function handleConfirm() {
    if (!clientId) {
      setError("Seleccioná un cliente");
      return;
    }
    if (!deviceModel.trim()) {
      setError("Ingresá el modelo del equipo");
      return;
    }
    if (!reportedFault.trim()) {
      setError("Ingresá la falla reportada");
      return;
    }
    setError(null);
    onConfirm({
      clientId,
      clientName,
      deviceModel,
      reportedFault,
      faultTags,
      agreedPrice,
      partsCost,
      technicianId,
      internalNotes,
      warrantyDays,
    });
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Datos de la orden de trabajo — {product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <ClientSelector
            storeId={storeId}
            branchId={branchId}
            selectedId={clientId || null}
            onSelect={(c) => {
              setClientId(c?.id ?? "");
              setClientName(c?.name ?? "");
            }}
          />

          <DeviceModelInput
            storeId={storeId}
            value={deviceModel}
            onChange={setDeviceModel}
            autoFocus
          />

          <div className="space-y-2">
            <Label htmlFor="reportedFault">Falla reportada *</Label>
            <Textarea
              id="reportedFault"
              value={reportedFault}
              onChange={(e) => setReportedFault(e.target.value)}
              placeholder="Descripción de la falla..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agreedPrice">Precio acordado *</Label>
            <PriceInput
              id="agreedPrice"
              value={agreedPrice}
              onChange={setAgreedPrice}
            />
          </div>

          <FaultTagSelector selected={faultTags} onChange={setFaultTags} />

          <div className="space-y-2">
            <Label>Técnico</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warrantyDays">Días de garantía</Label>
              <Input
                id="warrantyDays"
                type="number"
                min={0}
                value={warrantyDays}
                onChange={(e) => setWarrantyDays(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partsCost">Costo repuesto</Label>
              <PriceInput
                id="partsCost"
                value={partsCost}
                onChange={setPartsCost}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="internalNotes">Notas internas</Label>
            <Textarea
              id="internalNotes"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Notas para uso interno..."
              rows={2}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleConfirm}>
              Agregar al carrito
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
