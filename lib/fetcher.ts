export async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("Error al obtener datos");
    throw error;
  }
  return res.json();
}
