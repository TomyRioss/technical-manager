import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const itemId = formData.get("itemId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.split(".").pop();
  const fileName = itemId ? `${itemId}.${ext}` : `${crypto.randomUUID()}.${ext}`;

  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from("products")
    .upload(fileName, bytes, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    console.error("Upload to Supabase failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage
    .from("products")
    .getPublicUrl(fileName);

  if (itemId) {
    await prisma.item.update({
      where: { id: itemId },
      data: { imageUrl: publicUrlData.publicUrl },
    });
  }

  return NextResponse.json({ url: publicUrlData.publicUrl });
}
