"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { animate, stagger, set, remove } from "animejs";
import { cx } from "@/design-system/components/_shared/cx";
import {
  Information,
  UserMultiple,
  Tools,
  Map,
  Flash,
  FitToWidth,
} from "@carbon/icons-react";

type MenuItem = { label: string; href: string; icon: React.ReactNode };

const MENU: MenuItem[] = [
  { label: "Información General", href: "/gd", icon: <Information size={16} className="fill-current" /> },
  { label: "Empresas Instaladoras Inscritas", href: "/gd/instaladora", icon: <UserMultiple size={16} className="fill-current" /> },
  { label: "Herramienta de dimensionamiento", href: "/gd/dimensionamiento", icon: <Tools size={16} className="fill-current" /> },
  { label: "Geovisor", href: "/gd/geovisor", icon: <Map size={16} className="fill-current" /> },
  { label: "Geo-ElectroLinera", href: "/gd/geolinera", icon: <Flash size={16} className="fill-current" /> },
];

const WIDTH_EXPANDED = 290;
const WIDTH_COLLAPSED = 92;

const STORAGE_KEY = "gd.sidebar.collapsed";

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

function px(n: number) {
  return `${n}px`;
}

export function GDSidebar() {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();

  const [collapsed, setCollapsed] = useState(false);

  const asideRef = useRef<HTMLElement | null>(null);
  const itemLinkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const brandTextWrapRef = useRef<HTMLDivElement | null>(null);
  const sectionTitleRef = useRef<HTMLDivElement | null>(null);
  const groupLabelWrapRef = useRef<HTMLSpanElement | null>(null);
  const chevronRef = useRef<HTMLSpanElement | null>(null);
  const itemLabelWrapRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const detailsRef = useRef<HTMLDetailsElement | null>(null);
  const submenuWrapRef = useRef<HTMLDivElement | null>(null);

  // Load persisted state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "1") setCollapsed(true);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to read sidebar state", error);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to persist sidebar state", error);
      }
    }
  }, [collapsed]);

  function setLabelVisibility(show: boolean) {
    const brand = brandTextWrapRef.current;
    const sect = sectionTitleRef.current;
    const group = groupLabelWrapRef.current;
    const labels = itemLabelWrapRefs.current.filter(Boolean) as HTMLElement[];

    if (brand) brand.style.display = show ? "block" : "none";
    if (sect) sect.style.display = show ? "block" : "none";
    if (group) group.style.display = show ? "inline" : "none";
    labels.forEach((el) => (el.style.display = show ? "inline" : "none"));

    if (chevronRef.current) chevronRef.current.style.display = show ? "inline-flex" : "none";
  }

  function animateLabels(show: boolean) {
    if (reducedMotion) return;

    const brand = brandTextWrapRef.current;
    const sect = sectionTitleRef.current;
    const group = groupLabelWrapRef.current;
    const chev = chevronRef.current;
    const labelEls = itemLabelWrapRefs.current.filter(Boolean) as HTMLElement[];

    const batch: HTMLElement[] = [];
    if (brand) batch.push(brand);
    if (sect) batch.push(sect);
    if (group) batch.push(group);
    if (chev) batch.push(chev);
    batch.push(...labelEls);

    if (show) {
      batch.forEach((el) => (el.style.display = "inline"));
      if (brand) brand.style.display = "block";
      if (sect) sect.style.display = "block";
      if (chev) chev.style.display = "inline-flex";
    }

    remove(batch);

    if (show) {
      set(batch, { opacity: 0, translateX: -6, maxWidth: 0 });
      animate(batch, {
        opacity: [0, 1],
        translateX: [-6, 0],
        maxWidth: [0, 260],
        duration: 240,
        ease: "outQuad",
      });
    } else {
      animate(batch, {
        opacity: [1, 0],
        translateX: [0, -6],
        maxWidth: [260, 0],
        duration: 200,
        ease: "outQuad",
        onComplete: () => setLabelVisibility(false),
      });
    }
  }

  // Animate width on collapse/expand
  useEffect(() => {
    const aside = asideRef.current;
    if (!aside) return;

    const targetW = collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED;

    if (reducedMotion) {
      aside.style.width = px(targetW);
      setLabelVisibility(!collapsed);
      return;
    }

    const currentW = aside.getBoundingClientRect().width;

    remove(aside);
    animate(aside, {
      width: [px(currentW), px(targetW)],
      duration: 260,
      ease: "outQuad",
      onBegin: () => {
        aside.style.width = px(currentW);
      },
      onComplete: () => {
        aside.style.width = px(targetW);
      },
    });

    animateLabels(!collapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed, reducedMotion]);

  // Stagger entry (items)
  useEffect(() => {
    if (reducedMotion) return;

    const targets = itemLinkRefs.current.filter(Boolean) as HTMLElement[];
    if (!targets.length) return;

    set(targets, { opacity: 0, translateX: -6 });

    animate(targets, {
      opacity: [0, 1],
      translateX: [-6, 0],
      duration: 420,
      ease: "outQuad",
      delay: stagger(55, { start: 140 }),
    });
  }, [reducedMotion]);

  // Submenu toggle animation
  useEffect(() => {
    if (reducedMotion) return;

    const details = detailsRef.current;
    const submenu = submenuWrapRef.current;
    const chev = chevronRef.current;

    if (!details || !submenu || !chev) return;

    if (details.open) {
      set(chev, { rotate: 0 });
      submenu.style.height = "auto";
      submenu.style.opacity = "1";
    } else {
      set(chev, { rotate: -90 });
      submenu.style.height = "0px";
      submenu.style.opacity = "0";
      submenu.style.overflow = "hidden";
    }

    const onToggle = () => {
      const open = details.open;

      remove([submenu, chev]);

      if (!collapsed) {
        animate(chev, { rotate: open ? 0 : -90, duration: 220, ease: "outQuad" });
      }

      submenu.style.overflow = "hidden";

      if (open) {
        submenu.style.height = "0px";
        submenu.style.opacity = "0";
        const h = submenu.scrollHeight;

        animate(submenu, {
          height: [0, h],
          opacity: [0, 1],
          duration: 280,
          ease: "outQuad",
          onComplete: () => {
            submenu.style.height = "auto";
            submenu.style.overflow = "visible";
          },
        });
      } else {
        const current = submenu.offsetHeight;

        animate(submenu, {
          height: [current, 0],
          opacity: [1, 0],
          duration: 220,
          ease: "outQuad",
          onComplete: () => {
            submenu.style.height = "0px";
            submenu.style.opacity = "0";
            submenu.style.overflow = "hidden";
          },
        });
      }
    };

    details.addEventListener("toggle", onToggle);
    return () => details.removeEventListener("toggle", onToggle);
  }, [reducedMotion, collapsed]);

  // Micro-lift items
  function bindItemMotion(index: number) {
    const lift = (x: number) => {
      if (reducedMotion) return;
      const node = itemLinkRefs.current[index];
      if (!node) return;

      remove(node);
      animate(node, { translateX: x, duration: x === 0 ? 220 : 180, ease: "outQuad" });
    };

    return {
      onMouseEnter: () => lift(2),
      onMouseLeave: () => lift(0),
      onFocus: () => lift(2),
      onBlur: () => lift(0),
    };
  }

  function toggleCollapsed() {
    setCollapsed((v) => !v);
  }

  return (
    <aside
      ref={(n) => {
        asideRef.current = n;
      }}
      className={cx(
        "hidden lg:flex shrink-0",
        "sticky top-0 h-dvh",
        // ✅ clave: z-40 para que el handle no quede “detrás” del topbar (z-30)
        "z-40",
        "bg-[color:var(--color-ink,#0b1324)] text-white",
        "border-r border-white/10",
        "overflow-visible"
      )}
      style={{ width: px(collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED) }}
      aria-label="Sidebar"
    >
      <div className="w-full min-h-0 flex flex-col">
        {/* =======================
            HEADER (brand + toggle)
           ======================= */}
        <div
          className={cx(
            "h-16 border-b border-white/10 shrink-0",
            "relative",
            collapsed ? "px-2" : "px-4"
          )}
        >
          {!collapsed ? (
            // EXPANDED: botón en flujo a la derecha (no se superpone)
            <div className="h-full flex items-center gap-3">
              <Link href="/gd" className="flex items-center gap-3 min-w-0 flex-1">
                <div className="size-10 rounded-[calc(var(--ui-radius)-10px)] bg-white/10 border border-white/15 grid place-items-center font-display shrink-0">
                  PGD
                </div>

                <div
                  ref={(n) => {
                    brandTextWrapRef.current = n;
                  }}
                  className="min-w-0 leading-tight"
                  style={{ display: "block" }}
                >
                  <div className="font-display text-sm truncate">PGD</div>
                  <div className="text-xs text-white/60 truncate">
                    Plantas de Generación Distribuida
                  </div>
                </div>
              </Link>

              {/* ✅ FitToWidth + SIN animación vertical (sin translate Y) */}
              <button
                type="button"
                onClick={toggleCollapsed}
                className={cx(
                  "h-10 w-10 shrink-0 rounded-[calc(var(--ui-radius)-10px)]",
                  "border border-white/15 bg-white/10 hover:bg-white/15",
                  "grid place-items-center",
                  "text-white/85 transition",
                  "hover:shadow-[0_10px_25px_-18px_rgba(0,0,0,0.8)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                )}
                aria-label="Colapsar sidebar"
                aria-pressed={false}
                title="Colapsar"
              >
                <FitToWidth size={18} className="fill-current opacity-90" />
              </button>
            </div>
          ) : (
            // COLLAPSED: logo centrado + handle fuera del rail
            <>
              <Link href="/gd" className="h-full flex items-center justify-center">
                <div className="size-9 rounded-[calc(var(--ui-radius)-10px)] bg-white/10 border border-white/15 grid place-items-center font-display">
                  PGD
                </div>
              </Link>

              {/* ✅ handle con z alto + SIN animación vertical */}
              <button
                type="button"
                onClick={toggleCollapsed}
                className={cx(
                  "absolute top-1/2 -translate-y-1/2",
                  "-right-3 z-[60]",
                  "h-10 w-9",
                  "rounded-r-[calc(var(--ui-radius)-8px)] rounded-l-[calc(var(--ui-radius)-14px)]",
                  "border border-white/15 bg-white/10 hover:bg-white/15",
                  "grid place-items-center",
                  "text-white/90 transition",
                  "hover:shadow-[0_16px_30px_-22px_rgba(0,0,0,0.9)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                )}
                aria-label="Expandir sidebar"
                aria-pressed={true}
                title="Expandir"
              >
                <FitToWidth size={18} className="fill-current rotate-180 opacity-95" />
              </button>
            </>
          )}
        </div>

        {/* =======================
            SCROLL AREA
           ======================= */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]">
          <div className="px-4 pt-4 pb-2">
            <div
              ref={(n) => {
                sectionTitleRef.current = n;
              }}
              className="text-xs font-display text-white/50 tracking-wide overflow-hidden"
              style={{ display: collapsed ? "none" : "block" }}
            >
              GENERACIÓN DISTRIBUIDA
            </div>
          </div>

          <div className="px-2 pb-6">
            <details
              ref={(n) => {
                detailsRef.current = n;
              }}
              open
              className="group"
            >
              <summary
                className={cx(
                  "list-none cursor-pointer select-none",
                  "px-2 py-2 rounded-[calc(var(--ui-radius)-10px)]",
                  "hover:bg-white/6 flex items-center justify-between gap-3",
                  collapsed && "justify-center"
                )}
              >
                <span className={cx("flex items-center gap-3 min-w-0", collapsed && "justify-center")}>
                  <span className="size-8 rounded-[calc(var(--ui-radius)-12px)] bg-white/10 border border-white/15 grid place-items-center shrink-0">
                    ⬢
                  </span>

                  <span
                    ref={(n) => {
                      groupLabelWrapRef.current = n;
                    }}
                    className="font-display text-sm text-white/90 truncate overflow-hidden"
                    style={{ display: collapsed ? "none" : "inline" }}
                  >
                    Generadores Distribuidos
                  </span>
                </span>

                <span
                  ref={(n) => {
                    chevronRef.current = n;
                  }}
                  className="text-white/45 inline-flex"
                  aria-hidden="true"
                  style={{ display: collapsed ? "none" : "inline-flex" }}
                >
                  ▾
                </span>
              </summary>

              <div
                ref={(n) => {
                  submenuWrapRef.current = n;
                }}
                className="mt-2"
              >
                <nav className={cx("space-y-1", collapsed ? "px-1" : "pl-2 pr-2")} aria-label="Menú GD">
                  {MENU.map((item, idx) => {
                    const active = isActivePath(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        aria-label={item.label}
                        title={collapsed ? item.label : undefined}
                        ref={(n) => {
                          itemLinkRefs.current[idx] = n;
                        }}
                        {...bindItemMotion(idx)}
                        className={cx(
                          "flex items-center gap-3",
                          "py-2 rounded-[calc(var(--ui-radius)-12px)]",
                          "text-sm transition-colors duration-200",
                          collapsed ? "px-2 justify-center" : "px-3",
                          active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/6 hover:text-white",
                          "hover:ring-1 hover:ring-white/10",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        )}
                      >
                        <span className="text-white/70 shrink-0">{item.icon}</span>

                          <span
                          ref={(n) => {
                            itemLabelWrapRefs.current[idx] = n;
                          }}
                          className="min-w-0 truncate overflow-hidden"
                          style={{ display: collapsed ? "none" : "inline" }}
                        >
                          {item.label}
                        </span>

                        {collapsed ? <span className="sr-only">{item.label}</span> : null}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </details>
          </div>
        </div>

        {/* =======================
            FOOTER
           ======================= */}
        <div className="px-4 py-4 border-t border-white/10 text-xs text-white/55 shrink-0">
          {collapsed ? "AETN" : "AETN · GD"}
        </div>
      </div>
    </aside>
  );
}
