import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const storeId = req.nextUrl.searchParams.get("storeId");
    if (!storeId) {
      return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
    }

    // Orders by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const orders = await prisma.workOrder.findMany({
      where: { storeId, isActive: true, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, status: true, faultTags: true, technicianId: true, agreedPrice: true },
    });

    // Group by month
    const byMonth: Record<string, { count: number; revenue: number }> = {};
    orders.forEach((o) => {
      const key = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (!byMonth[key]) byMonth[key] = { count: 0, revenue: 0 };
      byMonth[key].count++;
      if (o.status === "ENTREGADO" && o.agreedPrice) {
        byMonth[key].revenue += o.agreedPrice;
      }
    });

    // Common faults
    const faultCount: Record<string, number> = {};
    orders.forEach((o) => {
      o.faultTags.forEach((tag) => {
        faultCount[tag] = (faultCount[tag] ?? 0) + 1;
      });
    });
    const commonFaults = Object.entries(faultCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([fault, count]) => ({ fault, count }));

    // Technician stats
    const techStats: Record<string, { name: string; total: number; delivered: number; revenue: number }> = {};
    const techs = await prisma.user.findMany({
      where: { storeId, isActive: true },
      select: { id: true, name: true },
    });
    techs.forEach((t) => {
      techStats[t.id] = { name: t.name, total: 0, delivered: 0, revenue: 0 };
    });
    orders.forEach((o) => {
      if (o.technicianId && techStats[o.technicianId]) {
        techStats[o.technicianId].total++;
        if (o.status === "ENTREGADO") {
          techStats[o.technicianId].delivered++;
          techStats[o.technicianId].revenue += o.agreedPrice ?? 0;
        }
      }
    });

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter((o) => o.status === "ENTREGADO").length;
    const totalRevenue = orders
      .filter((o) => o.status === "ENTREGADO")
      .reduce((s, o) => s + (o.agreedPrice ?? 0), 0);

    return NextResponse.json({
      summary: { totalOrders, deliveredOrders, totalRevenue },
      byMonth: Object.entries(byMonth)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, data]) => ({ month, ...data })),
      commonFaults,
      technicianStats: Object.values(techStats).filter((t) => t.total > 0),
    });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
