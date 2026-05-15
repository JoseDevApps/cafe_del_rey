"use client";

import { useEffect, useMemo, useState } from "react";
import { cx } from "@/design-system/components/_shared/cx";

const STORAGE_KEY = "gd.theme";
const LIGHT = "light";
const DARK = "cafe-rey-night"; // usa el mismo nombre que tu tokens/color.css

function usePrefersDark() {
  return useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  }, []);
}

export function ThemeSwitch() {
  const prefersDark = usePrefersDark();
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window === "undefined") return LIGHT;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const fromHtml = window.document.documentElement.dataset.theme;
    return saved ?? fromHtml ?? LIGHT;
  });

  // Inicializa/sincroniza html[data-theme] sin setState dentro del effect
  useEffect(() => {
    const html = document.documentElement;
    if (!html.dataset.theme) {
      const fallback = prefersDark ? DARK : LIGHT;
      html.dataset.theme = theme || fallback;
      return;
    }
    html.dataset.theme = theme;
  }, [prefersDark, theme]);

  const isDark = theme === DARK;

  function toggle() {
    const next = isDark ? LIGHT : DARK;
    document.documentElement.dataset.theme = next;
    localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cx(
        "relative inline-flex items-center",
        "h-10 w-[76px] rounded-full",
        "border border-border bg-muted",
        "shadow-[var(--ui-shadow-soft)]",
        "transition-colors"
      )}
      aria-label="Cambiar tema"
      aria-pressed={isDark}
      title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
    >
      {/* Track label */}
      <span
        className={cx(
            "absolute select-none text-[10px] leading-none text-fg/70",
            isDark ? "left-3 text-left" : "right-3 text-right"
        )}
        >
        {isDark ? "Dark" : "Light"}
    </span>

      {/* Thumb */}
      <span
        className={cx(
          "absolute top-1/2 -translate-y-1/2",
          "size-8 rounded-full",
          "bg-panel border border-border",
          "grid place-items-center text-sm",
          "transition-transform duration-200",
          isDark ? "translate-x-[42px]" : "translate-x-[6px]"
        )}
        aria-hidden="true"
      >
        {isDark ? "☾" : "☀"}
      </span>
    </button>
  );
}
