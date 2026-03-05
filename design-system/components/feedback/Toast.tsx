"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cx } from "../_shared/cx";

type ToastIntent = "info" | "success" | "warning" | "danger";

type ToastInput = {
  title: string;
  description?: string;
  intent?: ToastIntent;
};

type ToastItem = ToastInput & { id: string };

type ToastFn = (t: ToastInput) => void;

const ToastContext = createContext<ToastFn | null>(null);

export function useToast(): ToastFn {
  const fn = useContext(ToastContext);
  if (!fn) throw new Error("useToast must be used within ToastProvider");
  return fn;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toast = useMemo<ToastFn>(() => {
    return (t) => {
      const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      setItems((prev) => [...prev, { id, ...t }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== id));
      }, 3500);
    };
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {mounted
        ? createPortal(
            <div
              aria-live="polite"
              className="fixed z-50 right-4 bottom-4 w-[min(420px,calc(100vw-32px))] space-y-3"
            >
              {items.map((t) => (
                <div
                  key={t.id}
                  className={cx(
                    "rounded-[calc(var(--ui-radius)-6px)] border border-border bg-panel shadow-[var(--ui-shadow)] p-3",
                    "backdrop-blur-[2px]"
                  )}
                >
                  <div className="font-display text-sm">{t.title}</div>
                  {t.description ? <div className="text-sm opacity-80">{t.description}</div> : null}
                </div>
              ))}
            </div>,
            document.body
          )
        : null}
    </ToastContext.Provider>
  );
}
