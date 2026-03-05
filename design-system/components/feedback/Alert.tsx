import type React from "react";
import { cx } from "../_shared/cx";
import { Text } from "../data-display/Text";

export function Alert({
  title,
  tone = "info",
  children,
  className,
}: {
  title?: string;
  tone?: "info" | "danger" | "success";
  children?: React.ReactNode;
  className?: string;
}) {
  const tones = {
    info: "bg-[color-mix(in_oklab,var(--color-link)_14%,transparent)] border-[color-mix(in_oklab,var(--color-link)_35%,transparent)]",
    danger: "bg-[color-mix(in_oklab,var(--color-danger)_12%,transparent)] border-[color-mix(in_oklab,var(--color-danger)_35%,transparent)]",
    success: "bg-[color-mix(in_oklab,var(--color-flag-green)_12%,transparent)] border-[color-mix(in_oklab,var(--color-flag-green)_35%,transparent)]",
  } as const;

  return (
    <div className={cx("rounded-[var(--ui-radius)] border p-4 space-y-1", tones[tone], className)}>
      {title ? <Text className="font-medium">{title}</Text> : null}
      <Text tone="muted" size="sm">{children}</Text>
    </div>
  );
}
