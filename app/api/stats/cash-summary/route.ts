import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const storeId = req.nextUrl.searchParams.get("storeId");
    const branchId = req.nextUrl.searchParams.get("branchId");
    const period = req.nextUrl.searchParams.get("period") ?? "today";

    if (!storeId) {
      return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
    }

    const now = new Date();
    let start: Date;
    let prevStart: Date;
    let prevEnd: Date;

    switch (period) {
      case "week": {
        const day = now.getDay();
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
        prevStart = new Date(start);
        prevStart.setDate(prevStart.getDate() - 7);
        prevEnd = new Date(start);
        break;
      }
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevEnd = new Date(start);
        break;
      default: // today
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        prevStart = new Date(start);
        prevStart.setDate(prevStart.getDate() - 1);
        prevEnd = new Date(start);
        break;
    }

    // Current period - orders delivered
    const orderWhere: Record<string, unknown> = { storeId, status: "ENTREGADO", updatedAt: { gte: start }, isActive: true };
    if (branchId) orderWhere.branchId = branchId;

    const currentOrders = await prisma.workOrder.findMany({
      where: orderWhere,
      select: { agreedPrice: true },
    });

    // Previous period
    const prevOrderWhere: Record<string, unknown> = { storeId, status: "ENTREGADO", updatedAt: { gte: prevStart, lt: prevEnd }, isActive: true };
    if (branchId) prevOrderWhere.branchId = branchId;

    const prevOrders = await prisma.workOrder.findMany({
      where: prevOrderWhere,
      select: { agreedPrice: true },
    });

    // Current period - receipts
    const receiptWhere: Record<string, unknown> = { storeId, status: "COMPLETED", createdAt: { gte: start }, isActive: true };
    if (branchId) receiptWhere.branchId = branchId;

    const currentReceipts = await prisma.receipt.findMany({
      where: receiptWhere,
      select: { total: true, commissionAmount: true },
    });

    const prevReceiptWhere: Record<string, unknown> = { storeId, status: "COMPLETED", createdAt: { gte: prevStart, lt: prevEnd }, isActive: true };
    if (branchId) prevReceiptWhere.branchId = branchId;

    const prevReceipts = await prisma.receipt.findMany({
      where: prevReceiptWhere,
      select: { total: true, commissionAmount: true },
    });

    const currentOrdersTotal = currentOrders.reduce((s, o) => s + (o.agreedPrice ?? 0), 0);
    const prevOrdersTotal = prevOrders.reduce((s, o) => s + (o.agreedPrice ?? 0), 0);
    const currentReceiptsTotal = currentReceipts.reduce((s, r) => s + r.total, 0);
    const prevReceiptsTotal = prevReceipts.reduce((s, r) => s + r.total, 0);
    const currentCommissions = currentReceipts.reduce((s, r) => s + r.commissionAmount, 0);

    return NextResponse.json({
      period,
      orders: {
        count: currentOrders.length,
        total: currentOrdersTotal,
        prevTotal: prevOrdersTotal,
      },
      receipts: {
        count: currentReceipts.length,
        total: currentReceiptsTotal,
        prevTotal: prevReceiptsTotal,
      },
      commissions: currentCommissions,
      grandTotal: currentOrdersTotal + currentReceiptsTotal,
      prevGrandTotal: prevOrdersTotal + prevReceiptsTotal,
    });
  } catch (error: unknown) {
    console.error("GET /api/stats/cash-summary error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al obtener resumen de caja" }, { status: 500 });
  }
}
