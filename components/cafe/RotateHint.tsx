"use client";

import { useEffect, useState } from "react";

export function RotateHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(orientation: portrait)") ?? null;
    const mqW = window.matchMedia?.("(max-width: 840px)") ?? null;

    const update = () => setShow(Boolean(mq?.matches) && Boolean(mqW?.matches));
    update();

    mq?.addEventListener?.("change", update);
    mqW?.addEventListener?.("change", update);
    window.addEventListener("resize", update);

    return () => {
      mq?.removeEventListener?.("change", update);
      mqW?.removeEventListener?.("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-bg text-fg px-6"
      role="dialog"
      aria-modal="true"
      aria-label="Rotar dispositivo"
    >
      <div className="max-w-md w-full rounded-[calc(var(--ui-radius)+6px)] border border-border bg-panel p-6 shadow-[var(--ui-shadow)] grain">
        <div className="tracked font-sans text-[11px] uppercase text-fg/70">Café del Rey</div>
        <div className="mt-4 font-display text-3xl leading-[0.98]">
          Gira tu teléfono 90°
          <span className="block mt-1">para ver el sitio completo.</span>
        </div>
        <p className="mt-3 text-sm text-fg/80 leading-relaxed">
          Por ciencia (y por seguridad): evita derramar tu café mientras haces la maniobra.
        </p>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-10 flex-1 rounded-full border border-border bg-muted grid place-items-center tracked-tight text-[11px] uppercase">
            Landscape mode
          </div>
          <div className="h-10 w-10 rounded-full border border-border bg-muted grid place-items-center">↻</div>
        </div>
      </div>
    </div>
  );
}
