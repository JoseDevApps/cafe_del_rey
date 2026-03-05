import type React from "react";
import { cx } from "../_shared/cx";

export function Chip({
  tone = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "success" }) {
  const toneClass =
    tone === "success"
      ? "bg-[color-mix(in_oklab,var(--color-flag-green)_18%,transparent)] text-fg border-border"
      : "bg-muted text-fg border-border";

  return (
    <span
      {...props}
      className={cx(
        "inline-flex items-center px-3 py-1 rounded-full border text-xs",
        toneClass,
        className
      )}
    />
  );
}
