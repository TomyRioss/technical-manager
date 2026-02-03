import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, message } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { error: "phone y message son requeridos" },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppMessage({ phone, message });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
