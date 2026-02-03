"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientTagBadge } from "./client-tag-badge";
import { ClientHistory } from "./client-history";
import type { Client } from "@/types/client";
import { LuPencil, LuPhone, LuMail } from "react-icons/lu";
import Link from "next/link";

interface OrderSummary {
  id: string;
  orderCode: string;
  deviceModel: string;
  status: string;
  agreedPrice: number | null;
  createdAt: string;
}

interface ClientDetailProps {
  client: Client & { workOrders?: OrderSummary[] };
}

export function ClientDetail({ client }: ClientDetailProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>{client.name}</CardTitle>
            <ClientTagBadge tag={client.tag} />
          </div>
          <Link href={`/dashboard/clientes/${client.id}/edit`}>
            <Button variant="outline" size="sm">
              <LuPencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <LuPhone className="h-4 w-4 text-neutral-400" />
              <span>{client.phone || "Sin teléfono"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <LuMail className="h-4 w-4 text-neutral-400" />
              <span>{client.email || "Sin email"}</span>
            </div>
            <div className="text-sm">
              <span className="text-neutral-500">Visitas:</span>{" "}
              <span className="font-medium">{client.visitCount}</span>
            </div>
            <div className="text-sm">
              <span className="text-neutral-500">Total gastado:</span>{" "}
              <span className="font-medium">${client.totalSpent.toLocaleString("es-AR")}</span>
            </div>
          </div>
          {client.notes && (
            <div className="mt-4 text-sm text-neutral-600">
              <span className="text-neutral-500">Notas:</span> {client.notes}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de Órdenes</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientHistory orders={client.workOrders ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
