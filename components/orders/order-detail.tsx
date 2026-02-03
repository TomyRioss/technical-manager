"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { StatusChanger } from "./status-changer";
import { OrderTimeline } from "./order-timeline";
import { OrderEditModal } from "./order-edit-modal";
import { PhotoGallery } from "@/components/photos/photo-gallery";
import { PhotoUploader } from "@/components/photos/photo-uploader";
import { NotesList } from "@/components/notes/notes-list";
import { WarrantyInfo } from "@/components/warranty/warranty-info";
import { RatingDisplay } from "@/components/rating/rating-display";
import { SupplierLink } from "@/components/supplier/supplier-link";
import type { WorkOrder, OrderPhoto, OrderStatusLog } from "@/types/work-order";
import { LuUser, LuWrench, LuCalendar, LuDollarSign, LuPencil } from "react-icons/lu";
import Link from "next/link";

interface OrderDetailProps {
  order: WorkOrder;
  onRefresh?: () => void;
}

export function OrderDetail({ order, onRefresh }: OrderDetailProps) {
  const [photos, setPhotos] = useState<OrderPhoto[]>(order.photos ?? []);
  const [editOpen, setEditOpen] = useState(false);

  function handlePhotoUploaded(photo: { url: string; caption: string | null }) {
    setPhotos((prev) => [{ ...photo, id: crypto.randomUUID(), takenAt: new Date().toISOString(), orderId: order.id }, ...prev]);
    onRefresh?.();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>{order.orderCode}</CardTitle>
            <StatusBadge status={order.status} />
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <LuPencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Equipo</p>
              <p className="text-sm font-medium">{order.deviceModel}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Falla reportada</p>
              <p className="text-sm">{order.reportedFault}</p>
            </div>
          </div>

          {order.faultTags.length > 0 && (
            <div>
              <p className="text-xs text-neutral-500 mb-1">Etiquetas</p>
              <div className="flex flex-wrap gap-1">
                {order.faultTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <LuUser className="h-4 w-4 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-500">Cliente</p>
                {order.client ? (
                  <Link
                    href={`/dashboard/clientes/${order.client.id}`}
                    className="font-medium hover:underline"
                  >
                    {order.client.name}
                  </Link>
                ) : (
                  <span>—</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <LuWrench className="h-4 w-4 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-500">Técnico</p>
                <p className="font-medium">{order.technician?.name ?? "Sin asignar"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <LuDollarSign className="h-4 w-4 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-500">Precio</p>
                <p className="font-medium">
                  {order.agreedPrice != null
                    ? `$${order.agreedPrice.toLocaleString("es-AR")}`
                    : "No definido"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <LuCalendar className="h-4 w-4 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-500">Creada</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString("es-AR")}
                </p>
              </div>
            </div>
          </div>

          {order.internalNotes && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-neutral-500 mb-1">Notas internas</p>
              <p className="text-sm text-neutral-700">{order.internalNotes}</p>
            </div>
          )}

          {order.status === "ENTREGADO" && (
            <WarrantyInfo
              warrantyDays={order.warrantyDays}
              warrantyExpires={order.warrantyExpires}
              warrantyStatus={order.warrantyStatus}
            />
          )}

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-neutral-500 mb-2">Buscar repuestos</p>
            <SupplierLink deviceModel={order.deviceModel} />
          </div>
        </CardContent>
      </Card>

      {/* Estado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cambiar Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusChanger
            orderId={order.id}
            currentStatus={order.status}
            onStatusChanged={() => onRefresh?.()}
          />
        </CardContent>
      </Card>

      {/* Timeline */}
      {(order.statusLogs?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historial de Estados</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTimeline logs={order.statusLogs ?? []} />
          </CardContent>
        </Card>
      )}

      {/* Fotos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fotos del Equipo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PhotoUploader orderId={order.id} onUploaded={handlePhotoUploaded} />
          <PhotoGallery photos={photos} />
        </CardContent>
      </Card>

      {/* Notas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <NotesList orderId={order.id} initialNotes={order.notes} />
        </CardContent>
      </Card>

      {/* Valoración */}
      {order.rating && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Valoración del Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingDisplay
              stars={order.rating.stars}
              feedback={order.rating.feedback}
              createdAt={order.rating.createdAt}
            />
          </CardContent>
        </Card>
      )}

      <OrderEditModal
        order={order}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => onRefresh?.()}
      />
    </div>
  );
}
