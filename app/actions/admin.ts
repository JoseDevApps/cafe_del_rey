"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API = process.env.API_INTERNAL_URL ?? "http://localhost:8000";

async function getToken(): Promise<string> {
  const store = await cookies();
  return store.get("admin_token")?.value ?? "";
}

export async function loginAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });

  if (!res.ok) {
    return { error: "Credenciales incorrectas. Intenta de nuevo." };
  }

  const { access_token } = await res.json();
  const store = await cookies();
  store.set("admin_token", access_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete("admin_token");
  redirect("/admin/login");
}

export async function uploadImageAction(
  productId: string,
  formData: FormData
): Promise<{ image_url?: string; error?: string }> {
  const token = await getToken();
  const file = formData.get("file") as File | null;

  if (!file) return { error: "No se seleccionó archivo." };

  const body = new FormData();
  body.append("file", file);

  const res = await fetch(`${API}/products/${productId}/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: "Error desconocido" }));
    return { error: detail.detail ?? "Error al subir imagen." };
  }

  const data = await res.json();
  return { image_url: data.image_url };
}

export async function deleteImageAction(
  productId: string
): Promise<{ ok?: boolean; error?: string }> {
  const token = await getToken();

  const res = await fetch(`${API}/products/${productId}/image`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return { error: "Error al eliminar imagen." };
  return { ok: true };
}

// ── Gestión de productos ──────────────────────────────────────────────────────

export async function createProductAction(
  formData: FormData
): Promise<{ product?: import("@/types/api").ApiProduct; error?: string }> {
  const token = await getToken();

  // Recolectar tallas (hasta 5 filas; ignorar filas vacías)
  const sizes: Array<{ label: string; price: string }> = [];
  for (let i = 1; i <= 5; i++) {
    const label = (formData.get(`size_label_${i}`) as string | null)?.trim() ?? "";
    const price = (formData.get(`size_price_${i}`) as string | null)?.trim() ?? "";
    if (label && price) sizes.push({ label, price });
  }

  const body = {
    name:          (formData.get("name")          as string).trim(),
    note:          (formData.get("note")          as string).trim(),
    origin:        (formData.get("origin")        as string).trim(),
    process:       (formData.get("process")       as string).trim(),
    elevation:     (formData.get("elevation")     as string | null)?.trim() ?? "",
    sticker_text:  (formData.get("sticker_text")  as string | null)?.trim() ?? "",
    sticker_color: (formData.get("sticker_color") as string | null) ?? "#de6f14",
    sizes,
    sold_out: formData.get("sold_out") === "true",
  };

  const res = await fetch(`${API}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { error: (err as any).detail ?? "Error al crear el producto." };
  }

  const product = await res.json();
  return { product };
}

export async function deleteProductAction(
  productId: string
): Promise<{ error?: string }> {
  const token = await getToken();

  const res = await fetch(`${API}/products/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { error: (err as any).detail ?? "Error al eliminar el producto." };
  }
  return {};
}
