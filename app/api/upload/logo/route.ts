import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const storeId = formData.get("storeId") as string | null;

    if (!file || !storeId) {
      return NextResponse.json(
        { error: "Archivo y storeId son requeridos" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop();
    const fileName = `logos/${storeId}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();

    const { error } = await supabase.storage
      .from("store-assets")
      .upload(fileName, new Uint8Array(arrayBuffer), {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error("[upload/logo] Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from("store-assets")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err) {
    console.error("[upload/logo] Server error:", err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
