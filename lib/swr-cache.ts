const CACHE_KEY = "swr-cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function localStorageCacheProvider(): Map<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let map = new Map<string, any>();

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map = new Map(JSON.parse(raw) as [string, any][]);
      }
    } catch {
      // ignore corrupt cache
    }

    window.addEventListener("beforeunload", () => {
      try {
        const entries = Array.from(map.entries());
        localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
      } catch {
        // ignore storage full
      }
    });
  }

  return map;
}

export function clearSWRCache() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CACHE_KEY);
  }
}
