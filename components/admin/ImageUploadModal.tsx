"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Button, Modal, useToast } from "@/design-system/components";
import { uploadImageAction, deleteImageAction } from "@/app/actions/admin";
import { cx } from "@/design-system/components/_shared/cx";

type Props = {
  productId: string;
  productName: string;
  currentImageUrl?: string | null;
  onClose: () => void;
  onSuccess: (newUrl: string | null) => void;
};

export function ImageUploadModal({ productId, productName, currentImageUrl, onClose, onSuccess }: Props) {
  const toast = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleConfirm() {
    if (!selectedFile) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("file", selectedFile);
      const result = await uploadImageAction(productId, fd);

      if (result.error) {
        toast({ title: "Error al subir imagen", description: result.error, intent: "danger" });
        return;
      }

      toast({ title: "Foto actualizada", description: `"${productName}" tiene nueva imagen.`, intent: "success" });
      onSuccess(result.image_url ?? null);
      onClose();
    });
  }

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteImageAction(productId);
      if (result.error) {
        toast({ title: "Error", description: result.error, intent: "danger" });
        return;
      }
      toast({ title: "Foto eliminada", description: `"${productName}" volvió al diseño por defecto.`, intent: "success" });
      onSuccess(null);
      onClose();
    });
  }

  return (
    <Modal open onOpenChange={(v) => { if (!v) onClose(); }} title="Foto de producto">
      <div className="space-y-4">
        <p className="text-sm text-fg/70">
          Producto: <span className="text-fg font-semibold">{productName}</span>
        </p>

        {/* Preview area */}
        <div
          className={cx(
            "relative aspect-[4/3] rounded-[calc(var(--ui-radius)+2px)] border-2 border-dashed border-border",
            "bg-muted overflow-hidden grid place-items-center cursor-pointer",
            "hover:border-[color:var(--cafe-terracotta)] transition-colors",
            (isPending || isDeleting) && "opacity-50 pointer-events-none"
          )}
          onClick={() => fileRef.current?.click()}
        >
          {preview ? (
            <Image src={preview} alt="Preview" fill className="object-cover" />
          ) : currentImageUrl ? (
            <Image src={currentImageUrl} alt={productName} fill className="object-cover" />
          ) : (
            <div className="text-center space-y-2 p-6">
              <div className="text-3xl opacity-30">📷</div>
              <p className="text-sm text-fg/60">Haz clic para seleccionar una imagen</p>
              <p className="tracked-tight text-[10px] uppercase text-fg/40">JPEG · PNG · WebP · GIF</p>
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={handleFileChange}
        />

        {(preview || currentImageUrl) && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-[11px] tracked-tight uppercase text-fg/60 underline underline-offset-4 hover:text-fg"
          >
            Cambiar imagen seleccionada
          </button>
        )}

        <div className="flex gap-3">
          <Button
            variant="primary"
            className="flex-1"
            disabled={!selectedFile || isPending || isDeleting}
            onClick={handleConfirm}
          >
            {isPending ? "Subiendo…" : "Confirmar"}
          </Button>

          {currentImageUrl && !preview && (
            <Button variant="danger" disabled={isDeleting || isPending} onClick={handleDelete}>
              {isDeleting ? "…" : "Eliminar"}
            </Button>
          )}

          <Button variant="ghost" onClick={onClose} disabled={isPending || isDeleting}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
