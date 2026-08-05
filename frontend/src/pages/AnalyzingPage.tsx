const messages = [
  "Cevapların analiz ediliyor",
  "Karakter eşleşmen hazırlanıyor",
  "Güçlü ve zayıf yönlerin hesaplanıyor",
];

import { useEffect, useState } from "react";

export function AnalyzingPage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full bg-gradient-brand opacity-20 blur-xl" />
        <div className="h-16 w-16 animate-spin rounded-full border-[3px] border-secondary border-t-primary" />
      </div>
      <p key={index} className="animate-rise text-center text-base font-semibold text-foreground">
        {messages[index]}
      </p>
    </div>
  );
}
