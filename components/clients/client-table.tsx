"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ClientTagBadge } from "./client-tag-badge";
import type { Client } from "@/types/client";
import { LuPencil, LuTrash2, LuMessageCircle } from "react-icons/lu";

interface ClientTableProps {
  clients: Client[];
  onDelete?: (id: string) => void;
}

export function ClientTable({ clients, onDelete }: ClientTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (res.ok) {
      onDelete?.(id);
    }
    setDeletingId(null);
  }

  if (clients.length === 0) {
    return (
      <p className="text-sm text-neutral-500 text-center py-8">
        No hay clientes registrados.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Tag</TableHead>
          <TableHead className="text-right">Visitas</TableHead>
          <TableHead className="text-right">Total gastado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow
            key={client.id}
            className="cursor-pointer hover:bg-neutral-50"
            onClick={() => router.push(`/dashboard/clientes/${client.id}`)}
          >
            <TableCell className="font-medium text-neutral-900">
              {client.name}
            </TableCell>
            <TableCell className="text-neutral-600">
              {client.phone || "—"}
            </TableCell>
            <TableCell className="text-neutral-600">
              {client.email || "—"}
            </TableCell>
            <TableCell>
              <ClientTagBadge tag={client.tag} />
            </TableCell>
            <TableCell className="text-right text-neutral-600">
              {client.visitCount}
            </TableCell>
            <TableCell className="text-right text-neutral-600">
              ${client.totalSpent.toLocaleString("es-AR")}
            </TableCell>
            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-end gap-1">
                {client.phone && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-600 hover:text-green-700"
                    asChild
                  >
                    <a
                      href={`https://wa.me/${client.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LuMessageCircle className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => router.push(`/dashboard/clientes/${client.id}/edit`)}
                >
                  <LuPencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(client.id)}
                  disabled={deletingId === client.id}
                >
                  <LuTrash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
