"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-4xl">📡</p>
      <h1 className="text-lg font-extrabold text-ink">通信に失敗しました。もう一度お試しください。</h1>
      <Button onClick={reset} className="w-fit">
        もう一度試す
      </Button>
    </main>
  );
}
