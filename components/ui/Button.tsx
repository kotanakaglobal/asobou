import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

const sizes: Record<Size, string> = {
  md: "px-4 py-2.5 text-sm min-h-11",
  lg: "px-6 py-4 text-base min-h-14 w-full",
};

const variants: Record<Variant, string> = {
  primary: "bg-brand-500 text-white shadow-sm shadow-brand-500/30 hover:bg-brand-600",
  secondary: "bg-mint-50 text-mint-700 hover:bg-mint-100",
  ghost: "bg-white text-ink border border-line hover:bg-brand-50",
  danger: "bg-danger-soft text-danger hover:bg-danger hover:text-white",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "lg") {
  return `${base} ${sizes[size]} ${variants[variant]}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function Button({ variant = "primary", size = "lg", className = "", children, ...rest }: ButtonProps) {
  return (
    <button className={`${buttonClasses(variant, size)} ${className}`} {...rest}>
      {children}
    </button>
  );
}

type LinkButtonProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function LinkButton({ href, variant = "primary", size = "lg", className = "", children }: LinkButtonProps) {
  return (
    <Link href={href} className={`${buttonClasses(variant, size)} ${className}`}>
      {children}
    </Link>
  );
}
