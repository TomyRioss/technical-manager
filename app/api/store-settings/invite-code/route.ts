import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateInviteCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeId } = body;

    if (!storeId) {
      return NextResponse.json({ error: "storeId requerido" }, { status: 400 });
    }

    let inviteCode = generateInviteCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const existing = await prisma.storeSettings.findUnique({
        where: { inviteCode },
      });
      if (!existing) break;
      inviteCode = generateInviteCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: "No se pudo generar código único" },
        { status: 500 }
      );
    }

    const settings = await prisma.storeSettings.update({
      where: { storeId },
      data: { inviteCode },
      select: { inviteCode: true },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error generating invite code:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
