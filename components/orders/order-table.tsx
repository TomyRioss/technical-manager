"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./status-badge";
import type { WorkOrder } from "@/types/work-order";

interface OrderTableProps {
  orders: WorkOrder[];
}

export function OrderTable({ orders }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <p className="text-sm text-neutral-500 text-center py-8">
        No hay órdenes que coincidan con los filtros.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Equipo</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Técnico</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Precio</TableHead>
          <TableHead>Fecha</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <Link
                href={`/dashboard/ordenes/${order.id}`}
                className="font-medium text-neutral-900 hover:underline"
              >
                {order.orderCode}
              </Link>
            </TableCell>
            <TableCell className="text-neutral-600 max-w-[150px] truncate">
              {order.deviceModel}
            </TableCell>
            <TableCell className="text-neutral-600">
              {order.client?.name ?? "—"}
            </TableCell>
            <TableCell className="text-neutral-600">
              {order.technician?.name ?? "Sin asignar"}
            </TableCell>
            <TableCell>
              <StatusBadge status={order.status} />
            </TableCell>
            <TableCell className="text-right text-neutral-600">
              {order.agreedPrice != null
                ? `$${order.agreedPrice.toLocaleString("es-AR")}`
                : "—"}
            </TableCell>
            <TableCell className="text-neutral-500 text-sm">
              {new Date(order.createdAt).toLocaleDateString("es-AR")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
