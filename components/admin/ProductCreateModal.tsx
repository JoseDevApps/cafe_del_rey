"use client";

import { useState, useTransition } from "react";
import { Button, Input, Modal, useToast } from "@/design-system/components";
import { createProductAction } from "@/app/actions/admin";
import type { ApiProduct } from "@/types/api";
import { cx } from "@/design-system/components/_shared/cx";

const PROCESSES = ["Honey", "Lavado", "Natural", "Anaeróbico", "Experimental"];

const STICKER_COLORS = [
  { label: "Terracotta", value: "#de6f14" },
  { label: "Verde Yungas", value: "#3f6b3e" },
  { label: "Lila", value: "#c8aacb" },
  { label: "Crema", value: "#f7f2ea" },
  { label: "Tinta", value: "#1a1a14" },
  { label: "Azul", value: "#1e3a5f" },
];

type Props = {
  onClose: () => void;
  onSuccess: (product: ApiProduct) => void;
};

const selectCls = cx(
  "w-full h-10 rounded-[calc(var(--ui-radius)-6px)]",
  "border border-border bg-panel px-3 text-sm text-fg",
  "focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
);

export function ProductCreateModal({ onClose, onSuccess }: Props) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sizeCount, setSizeCount] = useState(1);
  const [process, setProcess] = useState("Honey");
  const [stickerColor, setStickerColor] = useState("#de6f14");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await createProductAction(fd);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if (result.product) {
        toast({
          title: "Producto creado",
          description: result.product.name,
          intent: "success",
        });
        onSuccess(result.product);
        onClose();
      }
    });
  }

  return (
    <Modal open onOpenChange={(v) => { if (!v) onClose(); }} title="Nuevo producto">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Datos básicos */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            name="name"
            label="Nombre del café"
            placeholder="Rey Miel"
            required
            disabled={isPending}
          />
          <Input
            name="origin"
            label="Origen"
            placeholder="Caranavi · Yungas"
            required
            disabled={isPending}
          />
        </div>

        <Input
          name="note"
          label="Descripción corta"
          placeholder="Notas de caramelo, fruta madura y chocolate..."
          required
          disabled={isPending}
        />

        <div className="grid sm:grid-cols-2 gap-3">
          {/* Proceso */}
          <div className="space-y-1.5">
            <label className="block tracked-tight text-[11px] uppercase text-fg/70">
              Proceso
            </label>
            <select
              name="process"
              value={process}
              onChange={(e) => setProcess(e.target.value)}
              className={selectCls}
              required
              disabled={isPending}
            >
              {PROCESSES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <Input
            name="elevation"
            label="Altura (opcional)"
            placeholder="1,450–1,750 msnm"
            disabled={isPending}
          />
        </div>

        {/* Tallas */}
        <div className="space-y-2">
          <div className="tracked-tight text-[11px] uppercase text-fg/70">
            Tallas y precios
          </div>

          {Array.from({ length: sizeCount }).map((_, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  name={`size_label_${i + 1}`}
                  label={i === 0 ? "Presentación" : undefined}
                  placeholder="250g"
                  required={i === 0}
                  disabled={isPending}
                />
              </div>
              <div className="flex-1">
                <Input
                  name={`size_price_${i + 1}`}
                  label={i === 0 ? "Precio" : undefined}
                  placeholder="Bs. 45"
                  required={i === 0}
                  disabled={isPending}
                />
              </div>
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => setSizeCount((c) => Math.max(1, c - 1))}
                  disabled={isPending}
                  className="h-10 w-10 shrink-0 mb-[1px] grid place-items-center rounded-full border border-border hover:bg-muted text-fg/50 hover:text-fg transition-colors"
                  aria-label="Eliminar talla"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {sizeCount < 5 && (
            <button
              type="button"
              onClick={() => setSizeCount((c) => c + 1)}
              disabled={isPending}
              className="tracked-tight text-[11px] uppercase text-fg/50 hover:text-fg underline underline-offset-4 transition-colors"
            >
              + Agregar talla
            </button>
          )}
        </div>

        {/* Sticker */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            name="sticker_text"
            label="Texto del sticker (opcional)"
            placeholder={process.slice(0, 12).toUpperCase()}
            disabled={isPending}
          />

          <div className="space-y-1.5">
            <label className="block tracked-tight text-[11px] uppercase text-fg/70">
              Color del sticker
            </label>
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: stickerColor }}
              />
              <select
                name="sticker_color"
                value={stickerColor}
                onChange={(e) => setStickerColor(e.target.value)}
                className={cx(selectCls, "flex-1")}
                disabled={isPending}
              >
                {STICKER_COLORS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Estado */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            name="sold_out"
            value="true"
            className="h-4 w-4 rounded accent-[color:var(--color-primary)]"
            disabled={isPending}
          />
          <span className="text-sm text-fg/80">Marcar como agotado</span>
        </label>

        {error && (
          <p className="rounded-[calc(var(--ui-radius)-6px)] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={isPending}
          >
            {isPending ? "Creando…" : "Crear producto"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
