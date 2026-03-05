import type React from "react";
import { cx } from "../_shared/cx";

type Variant = "body" | "display" | "h1" | "h2" | "h3";
type Tone = "default" | "muted" | "danger";
type Size = "xs" | "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  body: "text-base",
  display: "text-4xl md:text-5xl font-display font-semibold",
  h1: "text-3xl md:text-4xl font-display font-semibold",
  h2: "text-2xl md:text-3xl font-display font-semibold",
  h3: "text-xl md:text-2xl font-display font-semibold",
};

const toneStyles: Record<Tone, string> = {
  default: "text-fg",
  muted: "text-fg/70",
  danger: "text-danger",
};

const sizeStyles: Record<Size, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function Text<T extends React.ElementType = "p">({
  as,
  variant = "body",
  tone = "default",
  size = "md",
  className,
  ...props
}: {
  as?: T;
  variant?: Variant;
  tone?: Tone;
  size?: Size;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className">) {
  const Comp = (as ?? "p") as React.ElementType;

  // If using a heading/display variant, ignore size to avoid accidental mismatch.
  const usesOwnSize = variant === "body";
  return (
    <Comp
      {...props}
      className={cx(
        usesOwnSize ? sizeStyles[size] : "",
        variantStyles[variant],
        toneStyles[tone],
        className
      )}
    />
  );
}
