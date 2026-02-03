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
import type { OrderStatus } from "@/types/work-order";
import { useDashboard } from "@/contexts/dashboard-context";

const allStatuses: { value: OrderStatus; label: string }[] = [
  { value: "RECIBIDO", label: "Recibido" },
  { value: "EN_REVISION", label: "En revisión" },
  { value: "ESPERANDO_REPUESTO", label: "Esperando repuesto" },
  { value: "EN_REPARACION", label: "En reparación" },
  { value: "LISTO_PARA_RETIRAR", label: "Listo para retirar" },
  { value: "ENTREGADO", label: "Entregado" },
  { value: "SIN_REPARACION", label: "Sin reparación" },
];

interface StatusChangerProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusChanged: () => void;
}

export function StatusChanger({ orderId, currentStatus, onStatusChanged }: StatusChangerProps) {
  const { userId } = useDashboard();
  const [newStatus, setNewStatus] = useState<string>("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleChange() {
    if (!newStatus || newStatus === currentStatus) return;
    setSaving(true);
    const res = await fetch(`/api/work-orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        message: message.trim() || null,
        changedById: userId,
      }),
    });
    if (res.ok) {
      setNewStatus("");
      setMessage("");
      onStatusChanged();
    }
    setSaving(false);
  }

  return (
    <div className="space-y-3">
      <Select value={newStatus} onValueChange={setNewStatus}>
        <SelectTrigger>
          <SelectValue placeholder="Cambiar estado..." />
        </SelectTrigger>
        <SelectContent>
          {allStatuses
            .filter((s) => s.value !== currentStatus)
            .map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      <Textarea
        placeholder="Mensaje para el cliente (opcional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
      />
      <Button
        onClick={handleChange}
        disabled={saving || !newStatus || newStatus === currentStatus}
        className="w-full"
      >
        {saving ? "Actualizando..." : "Actualizar Estado"}
      </Button>
    </div>
  );
}
