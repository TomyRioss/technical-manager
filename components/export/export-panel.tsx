"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboard } from "@/contexts/dashboard-context";
import { LuDownload, LuLoaderCircle, LuWrench, LuUsers, LuReceipt } from "react-icons/lu";

const exportTypes = [
  { key: "orders", label: "Órdenes de Trabajo", icon: LuWrench },
  { key: "clients", label: "Clientes", icon: LuUsers },
  { key: "receipts", label: "Recibos", icon: LuReceipt },
];

const exportFormats = [
  { key: "xlsx", label: "Excel (.xlsx)" },
  { key: "csv", label: "CSV (.csv)" },
  { key: "json", label: "JSON (.json)" },
];

export function ExportPanel() {
  const { storeId } = useDashboard();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [formats, setFormats] = useState<Record<string, string>>({
    orders: "xlsx",
    clients: "xlsx",
    receipts: "xlsx",
  });

  async function handleExport(type: string) {
    const format = formats[type] || "xlsx";
    setDownloading(type);
    const res = await fetch(`/api/export?storeId=${storeId}&type=${type}&format=${format}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-${new Date().toISOString().split("T")[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setDownloading(null);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {exportTypes.map((t) => (
        <Card key={t.key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.label}</CardTitle>
            <t.icon className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={formats[t.key]}
              onValueChange={(val) => setFormats((prev) => ({ ...prev, [t.key]: val }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exportFormats.map((f) => (
                  <SelectItem key={f.key} value={f.key}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="w-full"
              disabled={downloading === t.key}
              onClick={() => handleExport(t.key)}
            >
              {downloading === t.key ? (
                <LuLoaderCircle className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <LuDownload className="h-4 w-4 mr-1" />
              )}
              Descargar
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
