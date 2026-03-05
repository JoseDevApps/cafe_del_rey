import type React from "react";
import { cx } from "../_shared/cx";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cx(
        "rounded-[var(--ui-radius)] bg-panel border border-border shadow-[var(--ui-shadow-soft)]",
        "backdrop-blur-[2px]",
        className
      )}
    />
  );
}
