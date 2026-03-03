import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const orderId = formData.get("orderId") as string | null;

    if (!file || !orderId) {
      return NextResponse.json(
        { error: "Archivo y orderId son requeridos" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop();
    const fileName = `orders/${orderId}/${crypto.randomUUID()}.${ext}`;

    const buffer = new Uint8Array(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from("order-photos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from("order-photos")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error: unknown) {
    console.error("POST /api/upload/order-photos error:", error);
    return NextResponse.json({ error: "Error al subir fotos de la orden" }, { status: 500 });
  }
}
