"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderStatus } from "@/types/work-order";

interface TechnicianOption {
  id: string;
  name: string;
}

interface OrderFiltersProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  technicianFilter: string;
  onTechnicianChange: (value: string) => void;
  technicians: TechnicianOption[];
}

const statusOptions: { value: string; label: string }[] = [
  { value: "ALL", label: "Todos los estados" },
  { value: "RECIBIDO", label: "Recibido" },
  { value: "EN_REVISION", label: "En revisión" },
  { value: "ESPERANDO_REPUESTO", label: "Esperando repuesto" },
  { value: "EN_REPARACION", label: "En reparación" },
  { value: "LISTO_PARA_RETIRAR", label: "Listo para retirar" },
  { value: "ENTREGADO", label: "Entregado" },
  { value: "SIN_REPARACION", label: "Sin reparación" },
];

export function OrderFilters({
  statusFilter,
  onStatusChange,
  technicianFilter,
  onTechnicianChange,
  technicians,
}: OrderFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={technicianFilter} onValueChange={onTechnicianChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Técnico" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos los técnicos</SelectItem>
          <SelectItem value="UNASSIGNED">Sin asignar</SelectItem>
          {technicians.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
