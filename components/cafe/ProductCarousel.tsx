"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { cx } from "@/design-system/components/_shared/cx";
import { ShopItem, type CafeProduct } from "./ShopItem";

type Props = {
  products: CafeProduct[];
};

export function ProductCarousel({ products }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const syncState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-card]")
    );
    if (cards.length === 0) return;

    // Find which card's left edge is closest to the scroll position
    let nearest = 0;
    let minDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft - track.scrollLeft);
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    });

    setActiveIdx(nearest);
    setAtStart(track.scrollLeft <= 4);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 4);
  }, []);

  // Sync on mount and whenever the product list changes length
  useEffect(() => {
    const id = setTimeout(syncState, 60); // wait for layout paint
    return () => clearTimeout(id);
  }, [syncState, products.length]);

  function goTo(idx: number) {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-card]")
    );
    const target = cards[idx];
    if (!target) return;
    track.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
    setActiveIdx(idx);
  }

  if (products.length === 0) {
    return (
      <div className="mt-6 rounded-[calc(var(--ui-radius)+4px)] border border-[color:color-mix(in_oklab,var(--cafe-paper)_20%,transparent)] bg-[color:color-mix(in_oklab,var(--cafe-paper)_8%,transparent)] py-10 text-center text-sm text-[color:color-mix(in_oklab,var(--cafe-paper)_55%,transparent)]">
        Próximamente — estamos preparando la tienda.
      </div>
    );
  }

  const showControls = products.length > 1;

  return (
    <div className="mt-6">
      {/* Scroll track */}
      <div
        ref={trackRef}
        onScroll={syncState}
        className={cx(
          "flex gap-4",
          "overflow-x-auto scroll-smooth snap-x snap-mandatory",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {products.map((p, i) => (
          <div
            key={p.id}
            data-card
            className={cx(
              "flex-none snap-start",
              // Mobile: 85 % wide → next card peeks at 15 %
              // sm (≥640): 2 cards side by side
              // xl (≥1280): 3 cards side by side
              "w-[85%] sm:w-[calc(50%-8px)] xl:w-[calc(33.333%-11px)]",
              "animate-entry"
            )}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <ShopItem product={p} />
          </div>
        ))}

        {/*
         * Trailing spacer — ensures the last card can reach the left snap-start
         * position. Width must be ≥ (container − card), per breakpoint:
         *   mobile : 100% − 85%          = 15%
         *   sm     : 100% − (50% − 8px) = 50% + 8px
         *   xl     : 100% − (33.33%−11px)= 66.67% + 11px
         */}
        <div
          aria-hidden
          className="flex-none w-[15%] sm:w-[calc(50%+8px)] xl:w-[calc(66.667%+11px)]"
        />
      </div>

      {/* Prev / dots / Next */}
      {showControls && (
        <div className="mt-5 flex items-center justify-between gap-4">
          <NavBtn
            aria-label="Anterior"
            disabled={atStart}
            onClick={() => goTo(Math.max(0, activeIdx - 1))}
          >
            ←
          </NavBtn>

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {products.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir al producto ${i + 1}`}
                className={cx(
                  "h-2 rounded-full transition-all duration-300",
                  "border border-[color:color-mix(in_oklab,var(--cafe-paper)_35%,transparent)]",
                  i === activeIdx
                    ? "w-6 bg-[color:var(--cafe-paper)]"
                    : "w-2 bg-[color:color-mix(in_oklab,var(--cafe-paper)_28%,transparent)] hover:bg-[color:color-mix(in_oklab,var(--cafe-paper)_55%,transparent)]"
                )}
              />
            ))}
          </div>

          <NavBtn
            aria-label="Siguiente"
            disabled={atEnd}
            onClick={() =>
              goTo(Math.min(products.length - 1, activeIdx + 1))
            }
          >
            →
          </NavBtn>
        </div>
      )}
    </div>
  );
}

/* ── Small arrow button ─────────────────────────────────────────────────── */

function NavBtn({
  children,
  disabled,
  onClick,
  "aria-label": label,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cx(
        "h-10 w-10 rounded-full grid place-items-center shrink-0",
        "border border-[color:color-mix(in_oklab,var(--cafe-paper)_28%,transparent)]",
        "bg-[color:color-mix(in_oklab,var(--cafe-paper)_12%,transparent)]",
        "text-[color:color-mix(in_oklab,var(--cafe-paper)_75%,transparent)]",
        "hover:bg-[color:color-mix(in_oklab,var(--cafe-paper)_22%,transparent)]",
        "hover:text-[color:var(--cafe-paper)]",
        "transition-colors touch-manipulation",
        "disabled:opacity-25 disabled:pointer-events-none"
      )}
    >
      {children}
    </button>
  );
}
