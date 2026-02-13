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

  const records = await prisma.paymentMethodCommission.findMany({
    where: { storeId },
  });

  const map = new Map(records.map((r) => [r.paymentMethod, r.commissionRate]));

  const commissions = ALL_METHODS.map((method) => ({
    paymentMethod: method,
    commissionRate: map.get(method) ?? 0,
  }));

  return NextResponse.json(commissions);
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
}
