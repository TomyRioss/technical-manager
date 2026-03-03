import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  try {
    const storeId = req.nextUrl.searchParams.get("storeId");
    const branchId = req.nextUrl.searchParams.get("branchId");
    const type = req.nextUrl.searchParams.get("type") ?? "orders";
    const format = req.nextUrl.searchParams.get("format") ?? "xlsx";

    if (!storeId) {
      return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
    }

    let data: Record<string, unknown>[] = [];
    let sheetName = "Datos";

    if (type === "orders") {
      sheetName = "Órdenes";
      const orderWhere: Record<string, unknown> = { storeId, isActive: true };
      if (branchId) orderWhere.branchId = branchId;
      const orders = await prisma.workOrder.findMany({
        where: orderWhere,
        include: {
          client: { select: { name: true, phone: true } },
          technician: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      data = orders.map((o) => ({
        Código: o.orderCode,
        Equipo: o.deviceModel,
        Falla: o.reportedFault,
        Estado: o.status,
        Precio: o.agreedPrice ?? "",
        Cliente: o.client.name,
        Teléfono: o.client.phone ?? "",
        Técnico: o.technician?.name ?? "",
        Garantía: o.warrantyDays ?? "",
        Creada: o.createdAt.toISOString().split("T")[0],
      }));
    } else if (type === "inventory") {
      sheetName = "Inventario";
      const itemWhere: Record<string, unknown> = { storeId, isDeleted: false };
      if (branchId) itemWhere.branchId = branchId;
      const items = await prisma.item.findMany({
        where: itemWhere,
        include: { category: { select: { name: true } } },
        orderBy: { name: "asc" },
      });
      data = items.map((i) => ({
        SKU: i.sku,
        Nombre: i.name,
        Descripción: i.description ?? "",
        Stock: i.stock,
        "Precio Costo": i.costPrice ?? "",
        "Precio Venta": i.salePrice,
        Categoría: i.category?.name ?? "",
        Activo: i.isActive ? "Sí" : "No",
        Creado: i.createdAt.toISOString().split("T")[0],
      }));
    } else if (type === "clients") {
      sheetName = "Clientes";
      const clientWhere: Record<string, unknown> = { storeId, isActive: true };
      if (branchId) clientWhere.branchId = branchId;
      const clients = await prisma.client.findMany({
        where: clientWhere,
        orderBy: { name: "asc" },
      });
      data = clients.map((c) => ({
        Nombre: c.name,
        Teléfono: c.phone ?? "",
        Email: c.email ?? "",
        Tag: c.tag,
        Visitas: c.visitCount,
        "Total Gastado": c.totalSpent,
        Creado: c.createdAt.toISOString().split("T")[0],
      }));
    } else if (type === "receipts") {
      sheetName = "Recibos";
      const receiptWhere: Record<string, unknown> = { storeId, isActive: true };
      if (branchId) receiptWhere.branchId = branchId;
      const receipts = await prisma.receipt.findMany({
        where: receiptWhere,
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      });
      data = receipts.map((r) => ({
        Número: r.receiptNumber,
        Estado: r.status,
        "Método de Pago": r.paymentMethod,
        Subtotal: r.subtotal,
        Comisión: r.commissionAmount,
        Total: r.total,
        Vendedor: r.user.name,
        Fecha: r.createdAt.toISOString().split("T")[0],
      }));
    }

    const filename = `${sheetName}-${new Date().toISOString().split("T")[0]}`;

    if (format === "json") {
      return NextResponse.json(data, {
        headers: {
          "Content-Disposition": `attachment; filename="${filename}.json"`,
        },
      });
    }

    if (format === "csv") {
      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      });
    }

    // Default: XLSX
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      },
    });
  } catch (error: unknown) {
    console.error("GET /api/export error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al exportar datos" }, { status: 500 });
  }
}
