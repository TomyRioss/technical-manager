import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { bucket, path } = await req.json();

    if (!bucket || !path) {
      return NextResponse.json({ error: "Faltan parámetros bucket o path" }, { status: 400 });
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error || !data) {
      console.error("Error creando signed upload URL:", error);
      return NextResponse.json({ error: "No se pudo generar la URL de subida" }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({
      signedUrl: data.signedUrl,
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
    });
  } catch (error) {
    console.error("POST /api/upload/signed-url error:", error);
    return NextResponse.json({ error: "Error al generar URL de subida" }, { status: 500 });
  }
}
