import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

interface BulkItem {
  sku: string;
  name: string;
  stock: number;
  costPrice: number | null;
  salePrice: number | null;
  isActive: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, items } = body as { storeId: string; items: BulkItem[] };

    if (!storeId) {
      return NextResponse.json({ error: "storeId es requerido" }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No hay items para crear" }, { status: 400 });
    }

    // Generar SKU único para items sin SKU
    const itemsWithSku = items.map((item) => ({
      ...item,
      sku: item.sku || `IMP-${nanoid(8)}`,
    }));

    const createdItems = await Promise.all(
      itemsWithSku.map((item) =>
        prisma.item.upsert({
          where: {
            storeId_sku: {
              storeId,
              sku: item.sku,
            },
          },
          update: {
            name: item.name,
            stock: item.stock ?? 0,
            costPrice: item.costPrice,
            salePrice: item.salePrice ?? 0,
            isActive: item.isActive,
            isDeleted: false,
          },
          create: {
            storeId,
            sku: item.sku,
            name: item.name,
            stock: item.stock ?? 0,
            costPrice: item.costPrice,
            salePrice: item.salePrice ?? 0,
            isActive: item.isActive,
          },
        })
      )
    );

    return NextResponse.json({ created: createdItems.length, items: createdItems });
  } catch (error) {
    console.error("Error creating bulk items:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: `Error al crear los productos: ${errorMessage}` },
      { status: 500 }
    );
  }
}
