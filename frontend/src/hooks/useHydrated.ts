import { useEffect, useState } from "react";

/** True only after the first client render — guards localStorage-driven UI. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
