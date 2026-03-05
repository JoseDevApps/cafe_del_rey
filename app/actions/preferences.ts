"use server";

import { cookies } from "next/headers";

export async function setUIPreferences(input: { theme?: string; scale?: string }) {
  const c = await cookies();
  if (input.theme) c.set("ui.theme", input.theme, { path: "/" });
  if (input.scale) c.set("ui.scale", input.scale, { path: "/" });
  return { ok: true };
}
