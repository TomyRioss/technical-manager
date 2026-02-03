"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboard } from "@/contexts/dashboard-context";
import { LuArrowLeft } from "react-icons/lu";

const METHODS = [
  { enum: "CASH", label: "Efectivo" },
  { enum: "DEBIT_TRANSFER", label: "Transferencia Debito" },
  { enum: "CREDIT_TRANSFER", label: "Transferencia Credito" },
  { enum: "OTHER", label: "Otro" },
];

export default function ComisionesPage() {
  const router = useRouter();
  const { commissions, updateCommissions } = useDashboard();
  const [saving, setSaving] = useState(false);

  const [local, setLocal] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const m of METHODS) {
      const found = commissions.find((c) => c.paymentMethod === m.enum);
      map[m.enum] = found?.commissionRate ?? 0;
    }
    return map;
  });

  async function handleSave() {
    setSaving(true);
    await updateCommissions(
      METHODS.map((m) => ({
        paymentMethod: m.enum,
        commissionRate: local[m.enum] ?? 0,
      }))
    );
    setSaving(false);
    router.push("/dashboard/recibos/create");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <LuArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-neutral-900">Administrar comisiones</h1>
      </div>

      <div className="max-w-md mx-auto space-y-4">
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

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
