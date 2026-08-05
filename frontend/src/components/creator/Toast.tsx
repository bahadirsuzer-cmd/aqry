import { useCallback, useEffect, useState } from "react";

export function useToast() {
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const show = useCallback((message: string) => setNotice(message), []);

  return { notice, show };
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="animate-rise fixed inset-x-0 bottom-6 z-50 mx-auto w-fit max-w-[90vw] rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background shadow-card"
    >
      {message}
    </div>
  );
}
