"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { animate, stagger, set, remove } from "animejs";
import { cx } from "@/design-system/components/_shared/cx";
import { Information, UserMultiple, Tools, Map, Flash } from "@carbon/icons-react";

/**
 * Drawer móvil para el menú GD.
 * - Controla estado open/rendered para poder animar CIERRE sin cortar.
 * - Animación: overlay fade + drawer slide + items stagger.
 */

type MenuItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const MENU: MenuItem[] = [
  { label: "Información General", href: "/gd", icon: <Information size={16} className="fill-current" /> },
  { label: "Empresas Instaladoras", href: "/gd/instaladora", icon: <UserMultiple size={16} className="fill-current" /> },
  { label: "Dimensionamiento", href: "/gd/dimensionamiento", icon: <Tools size={16} className="fill-current" /> },
  { label: "Geovisor", href: "/gd/geovisor", icon: <Map size={16} className="fill-current" /> },
  { label: "Geo-ElectroLinera", href: "/gd/geolinera", icon: <Flash size={16} className="fill-current" /> },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/gd") return pathname === "/gd";
  return pathname === href || pathname.startsWith(href + "/");
}

function usePrefersReducedMotion() {
  return useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);
}

export function GDMobileDrawer() {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();

  // open = intención del usuario; rendered = si el drawer está montado en el DOM
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);

  // refs para animación
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  // Abre: monta y anima
  const openDrawer = () => {
    if (open) return;
    setRendered(true);
    setOpen(true);
  };

  // Cierra: anima y desmonta al final
  const closeDrawer = () => {
    if (!open) return;
    setOpen(false);
  };

  // Cierre con ESC
  useEffect(() => {
    if (!rendered) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [rendered]);

  // Si cambia la ruta, cerramos el drawer (UX limpio)
  useEffect(() => {
    if (rendered) closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Animaciones: cuando open/rendered cambian
  useEffect(() => {
    if (!rendered) return;

    const overlay = overlayRef.current;
    const drawer = drawerRef.current;
    if (!overlay || !drawer) return;

    const items = itemRefs.current.filter(Boolean) as HTMLElement[];

    // Limpia animaciones previas
    remove([overlay, drawer, ...items]);

    if (reducedMotion) {
      // Sin animación: solo estados finales
      overlay.style.opacity = open ? "1" : "0";
      drawer.style.transform = open ? "translateX(0)" : "translateX(-16px)";
      if (!open) setRendered(false);
      return;
    }

    if (open) {
      // Estado inicial
      set(overlay, { opacity: 0 });
      set(drawer, { opacity: 0, translateX: -14 });
      set(items, { opacity: 0, translateX: -8 });

      // Overlay fade
      animate(overlay, {
        opacity: [0, 1],
        duration: 180,
        ease: "outQuad",
      });

      // Drawer slide-in
      animate(drawer, {
        opacity: [0, 1],
        translateX: [-14, 0],
        duration: 260,
        ease: "outQuad",
      });

      // Items stagger (sutil)
      animate(items, {
        opacity: [0, 1],
        translateX: [-8, 0],
        duration: 260,
        delay: stagger(45, { start: 120 }),
        ease: "outQuad",
      });
    } else {
      // Cierre: overlay + drawer out
      animate(overlay, {
        opacity: [1, 0],
        duration: 160,
        ease: "outQuad",
      });

      animate(drawer, {
        opacity: [1, 0],
        translateX: [0, -14],
        duration: 220,
        ease: "outQuad",
        onComplete: () => {
          // Desmonta al terminar
          setRendered(false);
        },
      });
    }
  }, [open, rendered, reducedMotion]);

  return (
    <>
      {/* Trigger (solo móvil) */}
      <button
        type="button"
        onClick={openDrawer}
        className={cx(
          "lg:hidden",
          "h-10 w-10 rounded-[calc(var(--ui-radius)-10px)]",
          "border border-border bg-muted hover:bg-muted/70",
          "grid place-items-center"
        )}
        aria-label="Abrir menú"
        aria-expanded={open}
        aria-controls="gd-mobile-drawer"
      >
        ☰
      </button>

      {/* Drawer + overlay */}
      {rendered ? (
        <div className="lg:hidden">
          {/* Overlay */}
          <div
            ref={(n) => (overlayRef.current = n)}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            id="gd-mobile-drawer"
            ref={(n) => (drawerRef.current = n)}
            className={cx(
              "fixed z-50 left-0 top-0 h-dvh",
              "w-[min(320px,88vw)]",
              "bg-[color:var(--color-ink,#0b1324)] text-white",
              "border-r border-white/10 shadow-[var(--ui-shadow)]",
              // Safe-area para notches (iOS)
              "pt-[env(safe-area-inset-top)]"
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Menú Generación Distribuida"
          >
            {/* Header */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-[calc(var(--ui-radius)-10px)] bg-white/10 border border-white/15 grid place-items-center font-display">
                  PGD
                </div>
                <div className="min-w-0">
                  <div className="font-display text-sm truncate">PGD</div>
                  <div className="text-xs text-white/60 truncate">Plantas de GD</div>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="h-10 w-10 rounded-[calc(var(--ui-radius)-10px)] border border-white/15 bg-white/10 hover:bg-white/15 grid place-items-center"
                aria-label="Cerrar menú"
              >
                ✕
              </button>
            </div>

            {/* Content scroll */}
            <div className="min-h-0 h-[calc(100dvh-64px-env(safe-area-inset-top))] overflow-y-auto px-3 py-4">
              <div className="px-2 pb-2 text-xs font-display text-white/50 tracking-wide">
                GENERACIÓN DISTRIBUIDA
              </div>

              <nav className="space-y-1" aria-label="Menú GD">
                {MENU.map((item, idx) => {
                  const active = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      ref={(n) => (itemRefs.current[idx] = n)}
                      className={cx(
                        "flex items-center gap-3",
                        "px-3 py-2 rounded-[calc(var(--ui-radius)-12px)] text-sm",
                        active ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/6 hover:text-white",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className="text-white/70">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/55">
                AETN · GD
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}