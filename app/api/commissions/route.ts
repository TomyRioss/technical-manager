import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { PaymentMethod } from "@/lib/generated/prisma";
import { checkReadOnly } from "@/lib/plan-guard";

const ALL_METHODS: PaymentMethod[] = ["CASH", "DEBIT_TRANSFER", "CREDIT_TRANSFER", "OTHER"];

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("storeId");
  if (!storeId) {
    return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
  }

  try {
    const records = await prisma.paymentMethodCommission.findMany({
      where: { storeId },
    });

    const map = new Map(records.map((r) => [r.paymentMethod, r.commissionRate]));

    const commissions = ALL_METHODS.map((method) => ({
      paymentMethod: method,
      commissionRate: map.get(method) ?? 0,
    }));

    return NextResponse.json(commissions);
  } catch (error: unknown) {
    console.error("GET /api/commissions error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al obtener las comisiones" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { storeId, commissions } = body as {
    storeId: string;
    commissions: { paymentMethod: PaymentMethod; commissionRate: number }[];
  };

  if (!storeId || !commissions?.length) {
    return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 });
  }

  const guard = await checkReadOnly(storeId);
  if (guard) return guard;

  try {
    const results = await prisma.$transaction(
      commissions.map((c) =>
        prisma.paymentMethodCommission.upsert({
          where: {
            storeId_paymentMethod: {
              storeId,
              paymentMethod: c.paymentMethod,
            },
          },
          update: { commissionRate: c.commissionRate },
          create: {
            storeId,
            paymentMethod: c.paymentMethod,
            commissionRate: c.commissionRate,
          },
        })
      )
    );

    return NextResponse.json(
      results.map((r) => ({
        paymentMethod: r.paymentMethod,
        commissionRate: r.commissionRate,
      }))
    );
  } catch (error: unknown) {
    console.error("PUT /api/commissions error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con esos datos" }, { status: 409 });
      if (code === "P2025") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al actualizar las comisiones" }, { status: 500 });
  }
}
