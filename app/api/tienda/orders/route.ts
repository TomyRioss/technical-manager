import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkReadOnly } from "@/lib/plan-guard";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, branchId, items } = body;

    if (!slug || !branchId || !items?.length) {
      return NextResponse.json(
        { error: "Campos requeridos faltantes" },
        { status: 400 }
      );
    }

    // Get store from slug
    const settings = await prisma.storeSettings.findUnique({
      where: { slug },
      select: { storeId: true },
    });

    if (!settings) {
      return NextResponse.json(
        { error: "Tienda no encontrada" },
        { status: 404 }
      );
    }

    const storeId = settings.storeId;

    const guard = await checkReadOnly(storeId);
    if (guard) return guard;

    // Find or create system user for online orders
    const systemEmail = `online@${storeId}.system`;
    let systemUser = await prisma.user.findUnique({
      where: { email: systemEmail },
    });

    if (!systemUser) {
      try {
        systemUser = await prisma.user.create({
          data: {
            name: "Pedidos Online",
            email: systemEmail,
            password: "SYSTEM_NO_LOGIN",
            role: "TECHNICIAN",
            isActive: false,
            storeId,
          },
        });
      } catch (err: any) {
        // P2002 = unique constraint (race condition)
        if (err?.code === "P2002") {
          systemUser = await prisma.user.findUnique({
            where: { email: systemEmail },
          });
          if (!systemUser) {
            console.error("Error creando usuario del sistema:", err);
            return NextResponse.json(
              { error: "Error interno al crear el pedido" },
              { status: 500 }
            );
          }
        } else {
          throw err;
        }
      }
    }

    // Validate items exist, are active, and have enough stock
    const productIds = items.map((i: { productId: string }) => i.productId);
    const dbItems = await prisma.item.findMany({
      where: { id: { in: productIds }, storeId, isActive: true },
    });

    const dbItemMap = new Map(dbItems.map((i) => [i.id, i]));

    for (const item of items) {
      const dbItem = dbItemMap.get(item.productId);
      if (!dbItem) {
        return NextResponse.json(
          { error: `Producto "${item.name}" no encontrado o no disponible` },
          { status: 400 }
        );
      }
      if (dbItem.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para "${item.name}" (disponible: ${dbItem.stock})` },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, i: { lineTotal: number }) => sum + i.lineTotal,
      0
    );

    // Generate receipt number
    const recReceipts = await prisma.receipt.findMany({
      where: { storeId, receiptNumber: { startsWith: "REC-" } },
      select: { receiptNumber: true },
    });
    const maxRec = recReceipts.reduce((max, r) => {
      const num = parseInt(r.receiptNumber.replace("REC-", "")) || 0;
      return Math.max(max, num);
    }, 0);
    const receiptNumber = `REC-${String(maxRec + 1).padStart(3, "0")}`;

    // Create receipt (PENDING, no stock deduction)
    const receipt = await prisma.receipt.create({
      data: {
        receiptNumber,
        status: "PENDING",
        paymentMethod: "OTHER",
        subtotal,
        commissionRate: 0,
        commissionAmount: 0,
        total: subtotal,
        notes: "[PEDIDO ONLINE]",
        storeId,
        branchId,
        userId: systemUser.id,
        items: {
          create: items.map(
            (i: {
              productId: string;
              quantity: number;
              unitPrice: number;
              lineTotal: number;
            }) => ({
              itemId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              lineTotal: i.lineTotal,
            })
          ),
        },
      },
    });

    return NextResponse.json(
      { receiptNumber: receipt.receiptNumber, total: receipt.total },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error en POST /api/tienda/orders:", err);
    return NextResponse.json(
      { error: "Error interno al crear el pedido" },
      { status: 500 }
    );
  }
}
