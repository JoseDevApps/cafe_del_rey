"use client";

import { useMemo, useState } from "react";
import { Button, Text } from "@/design-system/components";
import { cx } from "@/design-system/components/_shared/cx";
import { ProductImage } from "./ProductImage";

export type CafeProduct = {
  id: string;
  name: string;
  note: string;
  origin: string;
  process: string;
  elevation: string;
  sticker: { text: string; color: string };
  sizes: Array<{ label: string; price: string }>;
  soldOut?: boolean;
  imageUrl?: string;
};

export function ShopItem({ product }: { product: CafeProduct }) {
  const [qty, setQty] = useState(1);
  const [sizeIdx, setSizeIdx] = useState(0);

  const chosen = useMemo(() => product.sizes[sizeIdx] ?? product.sizes[0], [product, sizeIdx]);
  const soldOut = Boolean(product.soldOut);

  return (
    <article
      className={cx(
        "rounded-[calc(var(--ui-radius)+4px)] border border-[color-mix(in_oklab,var(--color-fg)_18%,transparent)]",
        "bg-[color:color-mix(in_oklab,var(--color-bg)_85%,white)] shadow-[var(--ui-shadow-soft)]",
        "p-4 grain group",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--ui-shadow)]"
      )}
    >
      <div className="aspect-[11/12] rounded-[calc(var(--ui-radius)+2px)] border border-border bg-muted grid place-items-center overflow-hidden">
        <ProductImage
          imageUrl={product.imageUrl}
          name={product.name}
          sticker={product.sticker}
        />
      </div>

      <div className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-sans tracked-tight text-[11px] uppercase text-fg/70">{product.origin}</div>
            <Text as="h3" variant="h3" className="mt-1 leading-tight">
              {product.name}
            </Text>
          </div>
          <div className="shrink-0 rounded-full border border-border bg-panel px-3 py-1 tracked-tight text-[11px] uppercase">
            {product.process}
          </div>
        </div>

        <p className="mt-2 text-sm text-fg/80 leading-relaxed">{product.note}</p>

        {/* Sizes */}
        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((s, i) => {
            const active = i === sizeIdx;
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => setSizeIdx(i)}
                className={cx(
                  "h-8 px-3 rounded-full border tracked-tight text-[11px] uppercase",
                  active
                    ? "bg-primary text-primary-fg border-[color-mix(in_oklab,var(--color-primary)_55%,transparent)]"
                    : "bg-panel text-fg/85 border-border hover:bg-muted"
                )}
                aria-pressed={active}
              >
                {s.label} <span className={cx(active ? "text-primary-fg/90" : "text-fg/60")}>{s.price}</span>
              </button>
            );
          })}
        </div>

        {/* Quantity + CTA */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-full border border-border bg-panel overflow-hidden">
            <button
              type="button"
              className="h-10 w-10 grid place-items-center hover:bg-muted active:bg-muted disabled:opacity-50 transition-colors touch-manipulation"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={soldOut}
              aria-label="Disminuir cantidad"
            >
              –
            </button>
            <div className="h-10 min-w-[2.5rem] px-2 grid place-items-center tracked-tight text-[11px] uppercase select-none">
              {qty}
            </div>
            <button
              type="button"
              className="h-10 w-10 grid place-items-center hover:bg-muted active:bg-muted disabled:opacity-50 transition-colors touch-manipulation"
              onClick={() => setQty((q) => Math.min(9, q + 1))}
              disabled={soldOut}
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          <Button
            variant={soldOut ? "ghost" : "primary"}
            className={cx(
              "flex-1 min-w-[120px] rounded-full shadow-none active:scale-[0.97] transition-transform",
              soldOut
                ? "border border-border bg-[color:color-mix(in_oklab,var(--color-fg)_6%,transparent)] text-fg/60 hover:bg-[color:color-mix(in_oklab,var(--color-fg)_8%,transparent)]"
                : "border border-[color-mix(in_oklab,var(--color-primary)_45%,transparent)]"
            )}
            disabled={soldOut}
            onClick={() => {
              // Stub: replace with a real cart later.
              alert(`Añadido: ${qty} × ${product.name} (${chosen.label})`);
            }}
          >
            {soldOut ? "Agotado" : "Añadir"}
          </Button>
        </div>

        <details className="mt-4 rounded-[calc(var(--ui-radius)-6px)] border border-border bg-panel p-3 open:pb-4 transition-all">
          <summary className="cursor-pointer tracked-tight text-[11px] uppercase text-fg/80 select-none list-none [&::-webkit-details-marker]:hidden flex items-center justify-between after:content-['+'] open:after:content-['-'] after:text-fg/40">
            Leer ficha
          </summary>
          <div className="pt-3 text-sm text-fg/80 leading-relaxed">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="tracked-tight text-[10px] uppercase text-fg/60">Altura</div>
                <div className="mt-1">{product.elevation}</div>
              </div>
              <div>
                <div className="tracked-tight text-[10px] uppercase text-fg/60">Proceso</div>
                <div className="mt-1">{product.process}</div>
              </div>
            </div>
            <div className="mt-3 tracked-tight text-[10px] uppercase text-fg/60">Sugerencia</div>
            <p className="mt-1">V60 / Prensa / Espresso — juega con la molienda hasta que te sonría el café.</p>
          </div>
        </details>
      </div>
    </article>
  );
}
