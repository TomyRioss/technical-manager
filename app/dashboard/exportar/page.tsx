"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ExportarRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/configuracion/exportar");
  }, [router]);
  return null;
}
