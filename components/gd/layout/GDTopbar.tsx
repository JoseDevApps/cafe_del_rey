import { Button } from "@/design-system/components";
import { TopLink } from "../ui/TopLink";
import { GDMobileDrawer } from "./GDMobileDrawer";
import { ThemeSwitch } from "./ThemeSwitch";
const TOPNAV = [
  { label: "Inicio", href: "/gd" },
  { label: "Web AETN", href: "https://www.aetn.gob.bo", external: true },
  { label: "Procedimientos GD", href: "https://www.aetn.gob.bo/web/main?mid=1&cid=218", external: true },
  { label: "Generación Distribuida", href: "https://www.aetn.gob.bo/web/main?mid=1&cid=216", external: true },
];

export function GDTopbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-panel/90 backdrop-blur">
      <div className="h-16 px-[var(--space-page-x)] flex items-center gap-3">
        {/* ✅ Menú móvil animado (drawer) */}
        <GDMobileDrawer />

        {/* Nav horizontal (desde md) */}
        <nav className="hidden md:flex items-center gap-2 overflow-x-auto">
          {TOPNAV.map((it) => (
            <TopLink key={it.label} item={it} active={it.label === "Inicio"} />
          ))}
        </nav>

        <div className="flex-1" />
        <ThemeSwitch />
        <Button href="/login" variant="secondary">
          Entrar
        </Button>
      </div>
    </header>
  );
}