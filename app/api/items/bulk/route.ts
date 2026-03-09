import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSku } from "@/lib/generate-sku";

interface BulkItem {
  sku: string;
  name: string;
  stock: number;
  costPrice: number | null;
  salePrice: number | null;
  isActive: boolean;
  category: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, branchId, items } = body as { storeId: string; branchId: string; items: BulkItem[] };

    if (!storeId || !branchId) {
      return NextResponse.json({ error: "storeId y branchId son requeridos" }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No hay items para crear" }, { status: 400 });
    }

    // Generar SKU único para items sin SKU
    const itemsWithSku = items.map((item) => ({
      ...item,
      sku: item.sku || generateSku(),
    }));

    // Resolver categorías: buscar existentes y crear las que faltan
    const uniqueCategoryNames = [
      ...new Set(
        itemsWithSku
          .map((item) => item.category?.trim())
          .filter((name): name is string => !!name)
      ),
    ];

    const categoryMap = new Map<string, string>();

    if (uniqueCategoryNames.length > 0) {
      const existingCategories = await prisma.category.findMany({
        where: { storeId, name: { in: uniqueCategoryNames } },
        select: { id: true, name: true },
      });

      for (const cat of existingCategories) {
        categoryMap.set(cat.name, cat.id);
      }

      const missingNames = uniqueCategoryNames.filter(
        (name) => !categoryMap.has(name)
      );

      if (missingNames.length > 0) {
        await prisma.category.createMany({
          data: missingNames.map((name) => ({
            storeId,
            name,
          })),
          skipDuplicates: true,
        });

        const newCategories = await prisma.category.findMany({
          where: { storeId, name: { in: missingNames } },
          select: { id: true, name: true },
        });

        for (const cat of newCategories) {
          categoryMap.set(cat.name, cat.id);
        }
      }
    }

    const createdItems = await Promise.all(
      itemsWithSku.map((item) => {
        const categoryId = item.category?.trim()
          ? categoryMap.get(item.category.trim()) || null
          : null;

        return prisma.item.upsert({
          where: {
            storeId_sku: {
              storeId,
              sku: item.sku,
            },
          },
          update: {
            branchId,
            name: item.name,
            stock: item.stock ?? 0,
            costPrice: item.costPrice,
            salePrice: item.salePrice ?? 0,
            isActive: item.isActive,
            isDeleted: false,
            categoryId,
          },
          create: {
            storeId,
            branchId,
            sku: item.sku,
            name: item.name,
            stock: item.stock ?? 0,
            costPrice: item.costPrice,
            salePrice: item.salePrice ?? 0,
            isActive: item.isActive,
            categoryId,
          },
        });
      })
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
