import type React from "react";
import { cx } from "../_shared/cx";

export function ButtonGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cx(
        "inline-flex overflow-hidden rounded-[calc(var(--ui-radius)-6px)] border border-border",
        "[&>*]:rounded-none [&>*]:border-0 [&>*]:shadow-none",
        "[&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-border",
        className
      )}
    />
  );
}
