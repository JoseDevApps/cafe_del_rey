"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/design-system/components";
import { ImageUploadModal } from "./ImageUploadModal";
import type { ApiProduct } from "@/types/api";
import { cx } from "@/design-system/components/_shared/cx";

type Props = {
  initialProducts: ApiProduct[];
};

export function ProductTable({ initialProducts }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<ApiProduct | null>(null);

  function handleImageUpdate(productId: string, newUrl: string | null) {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, image_url: newUrl } : p))
    );
  }

  return (
    <>
      <div className="rounded-[calc(var(--ui-radius)+4px)] border border-border bg-panel overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="text-left px-4 py-3 tracked-tight text-[11px] uppercase text-fg/60 font-normal">
                Producto
              </th>
              <th className="hidden md:table-cell text-left px-4 py-3 tracked-tight text-[11px] uppercase text-fg/60 font-normal">
                Proceso
              </th>
              <th className="hidden sm:table-cell text-left px-4 py-3 tracked-tight text-[11px] uppercase text-fg/60 font-normal">
                Imagen
              </th>
              <th className="px-4 py-3 w-40" />
            </tr>
          </thead>
          <tbody>
            {products.map((product, i) => (
              <tr
                key={product.id}
                className={cx(
                  "border-b border-border last:border-0",
                  "transition-colors hover:bg-muted/50"
                )}
              >
                <td className="px-4 py-4">
                  <div className="font-sans text-fg font-medium">{product.name}</div>
                  <div className="tracked-tight text-[10px] uppercase text-fg/50 mt-0.5">
                    {product.origin}
                  </div>
                  {product.sold_out && (
                    <span className="mt-1 inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 tracked-tight text-[9px] uppercase text-fg/50">
                      Agotado
                    </span>
                  )}
                </td>

                <td className="hidden md:table-cell px-4 py-4">
                  <span className="rounded-full border border-border bg-muted px-3 py-1 tracked-tight text-[11px] uppercase text-fg/70">
                    {product.process}
                  </span>
                </td>

                <td className="hidden sm:table-cell px-4 py-4">
                  {product.image_url ? (
                    <div className="relative h-12 w-12 rounded-[calc(var(--ui-radius)-8px)] border border-border overflow-hidden bg-muted">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-[calc(var(--ui-radius)-8px)] border border-dashed border-border bg-muted grid place-items-center">
                      <span className="text-[16px] opacity-30">📷</span>
                    </div>
                  )}
                </td>

                <td className="px-4 py-4 text-right">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditing(product)}
                    className="rounded-full"
                  >
                    {product.image_url ? "Cambiar foto" : "Subir foto"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ImageUploadModal
          productId={editing.id}
          productName={editing.name}
          currentImageUrl={editing.image_url}
          onClose={() => setEditing(null)}
          onSuccess={(url) => {
            handleImageUpdate(editing.id, url);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
