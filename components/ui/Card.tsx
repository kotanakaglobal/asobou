import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-line bg-card p-4 shadow-sm shadow-ink/5 ${className}`}>
      {children}
    </div>
  );
}
