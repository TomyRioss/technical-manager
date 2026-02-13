import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_TRIAL_DAYS } from "@/lib/store-plans";

function generateInviteCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, action, storeName, inviteCode } =
      await req.json();

    // Validaciones básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nombre, email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    if (action !== "create" && action !== "join") {
      return NextResponse.json(
        { error: "Acción inválida" },
        { status: 400 }
      );
    }

    // Verificar email único
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email" },
        { status: 409 }
      );
    }

    if (action === "create") {
      if (!storeName) {
        return NextResponse.json(
          { error: "El nombre de la tienda es requerido" },
          { status: 400 }
        );
      }

      // Crear Store con plan DEMO (trial de 14 días)
      const planExpiresAt = new Date();
      planExpiresAt.setDate(planExpiresAt.getDate() + DEMO_TRIAL_DAYS);

      const store = await prisma.store.create({
        data: { name: storeName, plan: "DEMO" as never, planExpiresAt },
      });

      // Crear StoreSettings con slug y código de invitación
      const slug = storeName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const inviteCode = generateInviteCode();

      await prisma.storeSettings.create({
        data: {
          storeId: store.id,
          slug,
          inviteCode,
          primaryColor: "#000000",
          unretrievedDays: 7,
        },
      });

      // Crear User como OWNER
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password,
          phone: phone || null,
          role: "OWNER",
          storeId: store.id,
        },
      });

      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          role: user.role,
          storeId: store.id,
          storeName: store.name,
        },
      });
    }

    // action === "join"
    if (!inviteCode) {
      return NextResponse.json(
        { error: "El código de invitación es requerido" },
        { status: 400 }
      );
    }

    const settings = await prisma.storeSettings.findFirst({
      where: {
        OR: [
          { inviteCode: inviteCode },
          { slug: inviteCode },
        ],
      },
      include: { store: { select: { id: true, name: true, isActive: true } } },
    });

    if (!settings || !settings.store.isActive) {
      return NextResponse.json(
        { error: "Código de invitación inválido" },
        { status: 404 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        phone: phone || null,
        role: "TECHNICIAN",
        storeId: settings.store.id,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
        storeId: settings.store.id,
        storeName: settings.store.name,
      },
    });
  } catch (error: unknown) {
    console.error("POST /api/auth/register error:", error);

    // Prisma P2002: unique constraint violation
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error del servidor. Intentá de nuevo más tarde." },
      { status: 500 }
    );
  }
}
