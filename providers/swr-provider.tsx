"use client";

import { SWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";
import { localStorageCacheProvider } from "@/lib/swr-cache";
import type { ReactNode } from "react";

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        provider: localStorageCacheProvider,
        revalidateOnFocus: false,
        dedupingInterval: 10000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
