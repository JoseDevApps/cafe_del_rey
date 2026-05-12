import type { CafeProduct } from "@/components/cafe/ShopItem";

export type SizeItem = {
  label: string;
  price: string;
};

export type ApiProduct = {
  id: string;
  name: string;
  note: string;
  origin: string;
  process: string;
  elevation: string;
  sticker_text: string;
  sticker_color: string;
  sizes: SizeItem[];
  sold_out: boolean;
  image_url: string | null;
};

/**
 * Converts an absolute image URL from the API ("http://api:8000/uploads/foo.png"
 * or "http://localhost:8000/uploads/foo.png") into the local proxy path
 * "/api/uploads/foo.png". This keeps next/image requests same-origin and avoids
 * Docker internal hostname leaking to the browser.
 */
export function toProxyUrl(imageUrl: string | null | undefined): string | undefined {
  if (!imageUrl) return undefined;
  const match = imageUrl.match(/\/uploads\/(.+)$/);
  return match ? `/api/uploads/${match[1]}` : undefined;
}

export function mapApiProduct(p: ApiProduct): CafeProduct {
  return {
    id: p.id,
    name: p.name,
    note: p.note,
    origin: p.origin,
    process: p.process,
    elevation: p.elevation,
    sticker: { text: p.sticker_text, color: p.sticker_color },
    sizes: p.sizes,
    soldOut: p.sold_out,
    imageUrl: toProxyUrl(p.image_url),
  };
}

export async function fetchProducts(): Promise<CafeProduct[]> {
  const base = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const res = await fetch(`${base}/products`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Error al obtener productos del API");
  const data: ApiProduct[] = await res.json();
  return data.map(mapApiProduct);
}
