"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WarrantyInfo } from "@/components/warranty/warranty-info";
import type { OrderStatus, WarrantyStatus } from "@/types/work-order";

const statusLabels: Record<string, string> = {
  RECIBIDO: "Recibido",
  EN_REVISION: "En revisión",
  ESPERANDO_REPUESTO: "Esperando repuesto",
  EN_REPARACION: "En reparación",
  LISTO_PARA_RETIRAR: "Listo para retirar",
  ENTREGADO: "Entregado",
  SIN_REPARACION: "Sin reparación",
};

const statusColors: Record<string, string> = {
  RECIBIDO: "bg-blue-100 text-blue-800",
  EN_REVISION: "bg-yellow-100 text-yellow-800",
  ESPERANDO_REPUESTO: "bg-orange-100 text-orange-800",
  EN_REPARACION: "bg-indigo-100 text-indigo-800",
  LISTO_PARA_RETIRAR: "bg-green-100 text-green-800",
  ENTREGADO: "bg-neutral-100 text-neutral-800",
  SIN_REPARACION: "bg-red-100 text-red-800",
};

interface StatusLog {
  fromStatus: string;
  toStatus: string;
  message: string | null;
  createdAt: string;
}

interface Photo {
  url: string;
  caption: string | null;
  takenAt: string;
}

interface TrackingOrder {
  orderCode: string;
  deviceModel: string;
  status: OrderStatus;
  technicianMessage: string | null;
  warrantyDays: number | null;
  warrantyExpires: string | null;
  warrantyStatus: WarrantyStatus | null;
  createdAt: string;
  photos: Photo[];
  statusLogs: StatusLog[];
}

interface TrackingResultProps {
  order: TrackingOrder;
  primaryColor: string;
}

export function TrackingResult({ order, primaryColor }: TrackingResultProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{order.orderCode}</CardTitle>
            <Badge className={statusColors[order.status]}>
              {statusLabels[order.status] ?? order.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-neutral-500">Equipo</p>
            <p className="text-sm font-medium">{order.deviceModel}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Fecha de ingreso</p>
            <p className="text-sm">{new Date(order.createdAt).toLocaleDateString("es-AR")}</p>
          </div>
          {order.technicianMessage && (
            <div className="p-3 rounded-lg bg-neutral-50 border border-border">
              <p className="text-xs text-neutral-500 mb-1">Mensaje del técnico</p>
              <p className="text-sm">{order.technicianMessage}</p>
            </div>
          )}
          <WarrantyInfo
            warrantyDays={order.warrantyDays}
            warrantyExpires={order.warrantyExpires}
            warrantyStatus={order.warrantyStatus}
          />
        </CardContent>
      </Card>

      {/* Timeline */}
      {order.statusLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Seguimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...order.statusLogs].reverse().map((log, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="h-3 w-3 rounded-full mt-1"
                      style={{ backgroundColor: primaryColor }}
                    />
                    {i < order.statusLogs.length - 1 && (
                      <div className="w-px flex-1 bg-neutral-200 mt-1" />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-medium">
                      {statusLabels[log.toStatus] ?? log.toStatus}
                    </p>
                    {log.message && (
                      <p className="text-sm text-neutral-600 mt-0.5">{log.message}</p>
                    )}
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {new Date(log.createdAt).toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photos */}
      {order.photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fotos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {order.photos.map((photo, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden border border-border">
                  <img
                    src={photo.url}
                    alt={photo.caption ?? "Foto"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
