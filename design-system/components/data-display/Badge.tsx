import type React from "react";
import { cx } from "../_shared/cx";

export function Badge({
  tone = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "danger" }) {
  const toneClass =
    tone === "danger"
      ? "bg-danger/15 text-danger border-danger/30"
      : "bg-primary/15 text-fg border-border";

  return (
    <span
      {...props}
      className={cx(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium",
        toneClass,
        className
      )}
    />
  );
}
