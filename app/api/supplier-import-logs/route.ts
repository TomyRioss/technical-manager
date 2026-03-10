import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("storeId");
  if (!storeId) {
    return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
  }

  try {
    const logs = await prisma.supplierImportLog.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      include: { supplier: { select: { id: true, name: true } } },
    } as any);

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET /api/supplier-import-logs error:", error);
    return NextResponse.json({ error: "Error al obtener el historial" }, { status: 500 });
  }
}
