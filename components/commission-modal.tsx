"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CommissionConfig {
  paymentMethod: string;
  commissionRate: number;
}

const METHODS = [
  { enum: "CASH", label: "Efectivo" },
  { enum: "DEBIT_TRANSFER", label: "Transferencia Debito" },
  { enum: "CREDIT_TRANSFER", label: "Transferencia Credito" },
  { enum: "OTHER", label: "Otro" },
];

interface CommissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commissions: CommissionConfig[];
  onSave: (commissions: CommissionConfig[]) => Promise<void>;
}

export function CommissionModal({
  open,
  onOpenChange,
  commissions,
  onSave,
}: CommissionModalProps) {
  const [local, setLocal] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const map: Record<string, number> = {};
      for (const m of METHODS) {
        const found = commissions.find((c) => c.paymentMethod === m.enum);
        map[m.enum] = found?.commissionRate ?? 0;
      }
      setLocal(map);
    }
  }, [open, commissions]);

  async function handleSave() {
    setSaving(true);
    await onSave(
      METHODS.map((m) => ({
        paymentMethod: m.enum,
        commissionRate: local[m.enum] ?? 0,
      }))
    );
    setSaving(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Administrar comisiones</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {METHODS.map((m) => (
            <div key={m.enum} className="flex items-center justify-between gap-4">
              <Label className="min-w-[160px] text-sm">{m.label}</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  className="w-24"
                  value={local[m.enum] ?? ""}
                  onChange={(e) =>
                    setLocal((prev) => ({
                      ...prev,
                      [m.enum]: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
                <span className="text-sm text-neutral-500">%</span>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
