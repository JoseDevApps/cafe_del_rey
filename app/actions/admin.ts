"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API = process.env.API_INTERNAL_URL ?? "http://localhost:8000";

type ApiErrorBody = {
  detail?: string;
  error?: {
    message?: string;
  };
};

function toErrorMessage(body: ApiErrorBody | null, fallback: string): string {
  return body?.error?.message ?? body?.detail ?? fallback;
}

async function readErrorBody(res: Response): Promise<ApiErrorBody | null> {
  try {
    return (await res.json()) as ApiErrorBody;
  } catch {
    return null;
  }
}

async function apiFetch(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, { cache: "no-store", ...init });
  } catch (error) {
    console.error("API network error", { url, error });
    throw new Error("No se pudo conectar con el API. Verifica que el backend esté activo.");
  }
}

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
  }).catch(() => null);

  if (!res) {
    return { error: "No se pudo conectar con el API. Verifica que el backend esté activo." };
  }

  if (!res.ok) {
    const detail = await readErrorBody(res);
    return { error: toErrorMessage(detail, "Credenciales incorrectas. Intenta de nuevo.") };
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

  let res: Response;
  try {
    res = await apiFetch(`${API}/products/${productId}/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error de conexión." };
  }

  if (!res.ok) {
    const detail = await readErrorBody(res);
    return { error: toErrorMessage(detail, "Error al subir imagen.") };
  }

  const data = await res.json();
  return { image_url: data.image_url };
}

export async function deleteImageAction(
  productId: string
): Promise<{ ok?: boolean; error?: string }> {
  const token = await getToken();

  let res: Response;
  try {
    res = await apiFetch(`${API}/products/${productId}/image`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error de conexión." };
  }

  if (!res.ok) {
    const detail = await readErrorBody(res);
    return { error: toErrorMessage(detail, "Error al eliminar imagen.") };
  }
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

  let res: Response;
  try {
    res = await apiFetch(`${API}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error de conexión." };
  }

  if (!res.ok) {
    const err = await readErrorBody(res);
    return { error: toErrorMessage(err, "Error al crear el producto.") };
  }

  const product = await res.json();
  return { product };
}

export async function updateProductAction(
  productId: string,
  formData: FormData
): Promise<{ product?: import("@/types/api").ApiProduct; error?: string }> {
  const token = await getToken();

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

  let res: Response;
  try {
    res = await apiFetch(`${API}/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error de conexión." };
  }

  if (!res.ok) {
    const err = await readErrorBody(res);
    return { error: toErrorMessage(err, "Error al actualizar el producto.") };
  }

  const product = await res.json();
  return { product };
}

export async function deleteProductAction(
  productId: string
): Promise<{ error?: string }> {
  const token = await getToken();

  let res: Response;
  try {
    res = await apiFetch(`${API}/products/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error de conexión." };
  }

  if (!res.ok) {
    const err = await readErrorBody(res);
    return { error: toErrorMessage(err, "Error al eliminar el producto.") };
  }
  return {};
}
