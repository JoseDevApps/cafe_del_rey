import Link from "next/link";
import { Text } from "@/design-system/components";
import { cx } from "@/design-system/components/_shared/cx";

export function CafeHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-panel/80 backdrop-blur grain">
      <div className="px-[var(--space-page-x)] h-16 flex items-center justify-between gap-4">
        <div className="min-w-0 flex items-center gap-3">
          <div className="size-9 rounded-full border border-border bg-muted grid place-items-center">
            <span className="font-display text-lg">👑</span>
          </div>
          <div className="min-w-0">
            <Text as="div" variant="h3" className="leading-tight truncate">
              Café del Rey
            </Text>
            <div className="tracked-tight text-[11px] uppercase text-fg/70 truncate">
              Los Yungas · La Paz, Bolivia
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          <TopLink href="#shop">Tienda</TopLink>
          <TopLink href="#historia">Historia</TopLink>
          <TopLink href="#contacto">Contacto</TopLink>
        </nav>

        <div className="flex items-center gap-2">
          <details className="relative">
            <summary
              className={cx(
                "list-none cursor-pointer",
                "h-10 px-4 rounded-full",
                "border border-border bg-muted",
                "tracked-tight text-[11px] uppercase",
                "grid place-items-center",
                "hover:bg-[color:color-mix(in_oklab,var(--color-fg)_6%,transparent)]"
              )}
            >
              Menú
            </summary>

            <div
              className={cx(
                "absolute right-0 mt-2 w-[min(86vw,420px)]",
                "rounded-[calc(var(--ui-radius)+8px)] border border-border bg-panel shadow-[var(--ui-shadow)]",
                "p-4"
              )}
            >
              <div className="tracked font-sans text-[11px] uppercase text-fg/70">Navegación</div>
              <div className="mt-3 grid gap-2">
                <MenuLink href="#shop">Tienda</MenuLink>
                <MenuLink href="#historia">Nuestra historia</MenuLink>
                <MenuLink href="#proceso">Proceso</MenuLink>
                <MenuLink href="#contacto">Contacto</MenuLink>
              </div>

              <div className="mt-4 rounded-[calc(var(--ui-radius)-4px)] border border-border bg-muted p-3 text-sm text-fg/80">
                <div className="tracked-tight text-[10px] uppercase text-fg/60">Envíos</div>
                <div className="mt-1">En La Paz: coordinación por WhatsApp. Nacional: courier.</div>
              </div>

              <div className="mt-3 flex justify-end">
                <span className="tracked-tight text-[11px] uppercase text-fg/60">Cerrar (esc)</span>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

function TopLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="h-10 px-3 rounded-full inline-flex items-center border border-transparent tracked-tight text-[11px] uppercase text-fg/75 hover:bg-muted"
    >
      {children}
    </Link>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-[calc(var(--ui-radius)-6px)] border border-border bg-muted px-4 py-3 hover:bg-[color:color-mix(in_oklab,var(--color-fg)_6%,transparent)]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="tracked-tight text-[11px] uppercase text-fg/80">{children}</span>
        <span className="text-fg/40">→</span>
      </div>
    </Link>
  );
}
