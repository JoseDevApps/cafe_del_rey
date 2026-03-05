import type React from "react";
import Link from "next/link";
import { cx } from "../_shared/cx";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

const variantStyles: Record<Variant, string> = {
  primary: "bg-primary text-primary-fg hover:brightness-[0.98]",
  secondary: "bg-secondary text-secondary-fg hover:brightness-[0.98]",
  danger: "bg-danger text-danger-fg hover:brightness-[0.98]",
  ghost: "bg-transparent text-fg hover:bg-muted",
};

export function Button({
  href,
  variant = "primary",
  size = "md",
  className,
  ...props
}: {
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
} & (React.ButtonHTMLAttributes<HTMLButtonElement> | React.AnchorHTMLAttributes<HTMLAnchorElement>)) {
  const base = cx(
    "inline-flex items-center justify-center gap-2",
    "rounded-[calc(var(--ui-radius)-8px)] border border-border shadow-[var(--ui-shadow-soft)]",
    "transition active:translate-y-[1px] disabled:opacity-[var(--opacity-disabled)] disabled:pointer-events-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--color-primary)_55%,white)] focus-visible:ring-offset-4 focus-visible:ring-offset-bg",
    sizeStyles[size],
    variantStyles[variant],
    className
  );

  if (href) {
    return <Link href={href} className={base} {...(props as any)} />;
  }

  return <button className={base} {...(props as any)} />;
}
