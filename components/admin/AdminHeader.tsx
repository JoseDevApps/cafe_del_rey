"use client";

import { logoutAction } from "@/app/actions/admin";
import { Button } from "@/design-system/components";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-panel/90 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-[color:var(--cafe-terracotta)]" />
          <span className="font-sans tracked-tight text-[12px] uppercase text-fg/80">
            Café del Rey — Panel Admin
          </span>
        </div>

        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="sm">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </header>
  );
}
