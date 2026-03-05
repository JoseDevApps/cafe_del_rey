import type React from "react";
import { cx } from "../_shared/cx";

export function Divider({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return <hr {...props} className={cx("border-0 h-px bg-border", className)} />;
}
