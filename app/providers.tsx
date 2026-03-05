"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/design-system/components/feedback/Toast";

export function AppProviders({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
