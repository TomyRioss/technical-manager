import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkReadOnly } from "@/lib/plan-guard";

interface ClientRow {
  Nombre: string;
  Teléfono?: string;
  Email?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeId, branchId, clients } = body as { storeId: string; branchId: string; clients: ClientRow[] };

    if (!storeId || !branchId || !Array.isArray(clients) || clients.length === 0) {
      return NextResponse.json({ error: "Datos inválidos o incompletos" }, { status: 400 });
    }

    const guard = await checkReadOnly(storeId);
    if (guard) return guard;

    let count = 0;

    for (const row of clients) {
      if (!row.Nombre) continue;

      const name = String(row.Nombre).trim();
      const phone = row.Teléfono ? String(row.Teléfono).trim() : null;
      const email = row.Email ? String(row.Email).trim() : null;

      // Skip if client with same phone already exists in store
      if (phone) {
        const existing = await prisma.client.findFirst({ where: { storeId, phone } });
        if (existing) continue;
      }

      await prisma.client.create({
        data: {
          name,
          phone,
          email,
          storeId,
          branchId,
          tag: "REGULAR",
        },
      });

      count++;
    }

    return NextResponse.json({ count });
  } catch (error: unknown) {
    console.error("POST /api/clients/bulk error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un cliente con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al importar clientes" }, { status: 500 });
  }
}
