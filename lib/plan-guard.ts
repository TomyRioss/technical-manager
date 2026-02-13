import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const READ_ONLY_MESSAGE =
  "Tu plan gratuito es de solo lectura. Actualizá tu plan para realizar cambios.";

/**
 * Checks if the store is on a read-only plan (FREE).
 * Also performs lazy downgrade: if plan is DEMO and expired, downgrades to FREE.
 * Returns a 403 NextResponse if read-only, or null if the request can proceed.
 */
export async function checkReadOnly(storeId: string): Promise<NextResponse | null> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { plan: true, planExpiresAt: true },
  });

  if (!store) {
    return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
  }

  // Lazy downgrade: DEMO expired → FREE
  if ((store.plan as string) === "DEMO" && store.planExpiresAt && new Date(store.planExpiresAt) < new Date()) {
    await prisma.store.update({
      where: { id: storeId },
      data: { plan: "FREE", planExpiresAt: null },
    });
    return NextResponse.json({ error: READ_ONLY_MESSAGE }, { status: 403 });
  }

  if (store.plan === "FREE") {
    return NextResponse.json({ error: READ_ONLY_MESSAGE }, { status: 403 });
  }

  return null;
}
