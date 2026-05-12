"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Text } from "@/design-system/components";
import { cx } from "@/design-system/components/_shared/cx";

export function CafeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Cerrar con tecla Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen]);

  // Bloquear scroll del body cuando el menú está abierto en móvil
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-panel/80 backdrop-blur grain">
        <div className="px-[var(--space-page-x)] h-16 flex items-center justify-between gap-4">

          {/* Marca */}
          <div className="min-w-0 flex items-center gap-3">
            <div className="shrink-0 size-9 rounded-full border border-border bg-muted grid place-items-center">
              <span className="font-display text-lg">👑</span>
            </div>
            <div className="min-w-0">
              <Text as="div" variant="h3" className="leading-tight truncate">
                Café del Rey
              </Text>
              <div className="hidden sm:block tracked-tight text-[11px] uppercase text-fg/70 truncate">
                Los Yungas · La Paz, Bolivia
              </div>
            </div>
          </div>

          {/* Nav escritorio */}
          <nav className="hidden md:flex items-center gap-2">
            <TopLink href="#shop">Tienda</TopLink>
            <TopLink href="#historia">Historia</TopLink>
            <TopLink href="#contacto">Contacto</TopLink>
          </nav>

          {/* Botón menú */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            className={cx(
              "shrink-0 h-10 px-4 rounded-full",
              "border border-border bg-muted",
              "tracked-tight text-[11px] uppercase",
              "inline-flex items-center justify-center gap-1.5",
              "hover:bg-[color:color-mix(in_oklab,var(--color-fg)_6%,transparent)]",
              "transition-colors"
            )}
          >
            {menuOpen ? (
              <>
                <span aria-hidden>✕</span>
                <span className="hidden sm:inline">Cerrar</span>
              </>
            ) : (
              "Menú"
            )}
          </button>
        </div>
      </header>

      {/* Backdrop + panel flotante — fuera del <header> para evitar conflictos de stacking context */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-fg/10 backdrop-blur-[2px]"
            onClick={close}
            aria-hidden
          />

          {/* Panel del menú */}
          <div
            role="dialog"
            aria-label="Menú de navegación"
            className={cx(
              "fixed right-[var(--space-page-x)] top-[calc(4rem+1px)] z-50",
              "w-[min(88vw,420px)]",
              "rounded-[calc(var(--ui-radius)+8px)] border border-border bg-panel",
              "shadow-[var(--ui-shadow)] grain",
              "p-4"
            )}
          >
            <div className="tracked font-sans text-[11px] uppercase text-fg/70">
              Navegación
            </div>

            <nav className="mt-3 grid gap-2">
              <MenuLink href="#shop" onClick={close}>Tienda</MenuLink>
              <MenuLink href="#historia" onClick={close}>Nuestra historia</MenuLink>
              <MenuLink href="#proceso" onClick={close}>Proceso</MenuLink>
              <MenuLink href="#contacto" onClick={close}>Contacto</MenuLink>
            </nav>

            <div className="mt-4 rounded-[calc(var(--ui-radius)-4px)] border border-border bg-muted p-3 text-sm text-fg/80">
              <div className="tracked-tight text-[10px] uppercase text-fg/60">Envíos</div>
              <div className="mt-1">
                En La Paz: coordinación por WhatsApp. Nacional: courier.
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={close}
                className="tracked-tight text-[11px] uppercase text-fg/50 hover:text-fg transition-colors"
              >
                Cerrar (esc)
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function TopLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="h-10 px-3 rounded-full inline-flex items-center border border-transparent tracked-tight text-[11px] uppercase text-fg/75 hover:bg-muted transition-colors"
    >
      {children}
    </Link>
  );
}

function MenuLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-[calc(var(--ui-radius)-6px)] border border-border bg-muted px-4 py-3 hover:bg-[color:color-mix(in_oklab,var(--color-fg)_6%,transparent)] transition-colors active:scale-[0.98]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="tracked-tight text-[11px] uppercase text-fg/80">{children}</span>
        <span className="text-fg/40">→</span>
      </div>
    </Link>
  );
}
