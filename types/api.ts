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
    imageUrl: p.image_url ?? undefined,
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
