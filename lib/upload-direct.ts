/**
 * Sube un archivo directamente a Supabase Storage sin pasar por Vercel,
 * evitando el límite de 4.5MB de las serverless functions.
 */
export async function uploadDirect(
  file: File,
  bucket: string,
  fileName: string
): Promise<string> {
  // 1. Pedir signed upload URL al servidor
  const res = await fetch("/api/upload/signed-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bucket, path: fileName }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Error al obtener URL de subida");
  }

  const { signedUrl, publicUrl } = await res.json();

  // 2. Subir directamente a Supabase (sin pasar por Vercel)
  const uploadRes = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("Error al subir el archivo a Supabase");
  }

  return publicUrl;
}
