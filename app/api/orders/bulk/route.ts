import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkReadOnly } from "@/lib/plan-guard";

interface OrderRow {
  Equipo: string;
  Falla: string;
  Estado?: string;
  Precio?: string | number;
  Cliente: string;
  Teléfono?: string;
  Garantía?: string | number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeId, branchId, orders } = body as { storeId: string; branchId: string; orders: OrderRow[] };

    if (!storeId || !branchId || !Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ error: "Datos inválidos o incompletos" }, { status: 400 });
    }

    const guard = await checkReadOnly(storeId);
    if (guard) return guard;

    let count = 0;

    for (const row of orders) {
      if (!row.Equipo || !row.Falla || !row.Cliente) continue;

      const phone = row.Teléfono ? String(row.Teléfono).trim() : null;

      // Find or create client
      let client = phone
        ? await prisma.client.findFirst({ where: { storeId, phone } })
        : null;

      if (!client) {
        client = await prisma.client.create({
          data: {
            name: String(row.Cliente).trim(),
            phone,
            storeId,
            branchId,
            tag: "NEW",
          },
        });
      }

      // Generate orderCode
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
      const existing = await prisma.workOrder.count({
        where: {
          branchId,
          createdAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          },
        },
      });
      const orderCode = `OT-${dateStr}-${String(existing + 1).padStart(3, "0")}`;

      const validStatuses = ["PENDIENTE", "EN_PROCESO", "LISTO", "ENTREGADO", "SIN_REPARACION"];
      const rawStatus = row.Estado ? String(row.Estado).toUpperCase().replace(/ /g, "_") : "PENDIENTE";
      const status = validStatuses.includes(rawStatus) ? rawStatus : "PENDIENTE";

      await prisma.workOrder.create({
        data: {
          orderCode,
          deviceModel: String(row.Equipo).trim(),
          reportedFault: String(row.Falla).trim(),
          faultTags: [],
          agreedPrice: row.Precio ? parseFloat(String(row.Precio)) : null,
          clientId: client.id,
          storeId,
          branchId,
          status: status as never,
          warrantyDays: row.Garantía ? parseInt(String(row.Garantía)) : null,
          createdById: client.id, // placeholder; no user context in bulk import
        },
      });

      count++;
    }

    return NextResponse.json({ count });
  } catch (error: unknown) {
    console.error("POST /api/orders/bulk error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe una orden con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al importar órdenes" }, { status: 500 });
  }
}
