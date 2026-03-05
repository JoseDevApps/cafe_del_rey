"use client";

import type React from "react";

import { cx } from "../_shared/cx";
import { Text } from "../data-display/Text";

export function Textarea({
  label,
  hint,
  error,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
}) {
  const invalid = Boolean(error);

  return (
    <label className="block space-y-1.5">
      {label ? <Text size="sm" className="font-medium">{label}</Text> : null}
      <textarea
        {...props}
        aria-invalid={invalid || undefined}
        className={cx(
          "w-full min-h-28 px-3 py-2 rounded-[calc(var(--ui-radius)-10px)]",
          "bg-bg text-fg border border-border shadow-[var(--ui-shadow-soft)]",
          "placeholder:text-fg/45",
          "focus:outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-primary)_55%,white)] focus:ring-offset-4 focus:ring-offset-bg",
          invalid ? "border-danger/60" : "",
          className
        )}
      />
      {error ? <Text size="xs" tone="danger">{error}</Text> : hint ? <Text size="xs" tone="muted">{hint}</Text> : null}
    </label>
  );
}
