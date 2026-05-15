"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { cx } from "../_shared/cx";
import { Text } from "../data-display/Text";
import { Divider } from "../data-display/Divider";

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onCancel = (e: Event) => {
      e.preventDefault();
      onOpenChange(false);
    };

    const onClose = () => onOpenChange(false);

    el.addEventListener("cancel", onCancel);
    el.addEventListener("close", onClose);
    return () => {
      el.removeEventListener("cancel", onCancel);
      el.removeEventListener("close", onClose);
    };
  }, [onOpenChange]);

  return (
    <dialog
      ref={ref}
      className={cx(
        "p-0 bg-transparent border-0 w-[min(680px,calc(100vw-32px))]",
        "overflow-hidden"
      )}
      onClick={(e) => {
        // click outside closes (basic behavior)
        if (e.target === ref.current) onOpenChange(false);
      }}
    >
      <div className="rounded-[var(--ui-radius)] bg-panel border border-border shadow-[var(--ui-shadow)]">
        <div className="p-5 space-y-2">
          {title ? <Text as="h3" variant="h3">{title}</Text> : null}
          {description ? <Text tone="muted" size="sm">{description}</Text> : null}
        </div>

        <Divider />

        <div className="p-5 space-y-3 max-h-[min(60dvh,480px)] overflow-y-auto overscroll-contain">{children}</div>

        {footer ? (
          <>
            <Divider />
            <div className="p-4">{footer}</div>
          </>
        ) : null}
      </div>
    </dialog>
  );
}
