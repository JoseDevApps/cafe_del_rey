"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/admin";
import { Button, Input, Text } from "@/design-system/components";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-dvh bg-bg text-fg grid place-items-center px-[var(--space-page-x)]">
      <div className="w-full max-w-sm space-y-8">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-full bg-[color:var(--cafe-terracotta)] items-center justify-center text-[color:var(--cafe-paper)] text-xl font-display">
            R
          </div>
          <Text as="h1" variant="h2">Acceso admin</Text>
          <p className="text-sm text-fg/60">Café del Rey · Panel de gestión</p>
        </div>

        <form action={formAction} className="space-y-4">
          <Input
            name="username"
            label="Usuario"
            placeholder="superadmin"
            autoComplete="username"
            required
            disabled={isPending}
          />

          <Input
            name="password"
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            disabled={isPending}
            error={state?.error}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? "Verificando…" : "Entrar"}
          </Button>
        </form>

        <div className="text-center">
          <a
            href="/"
            className="text-[11px] tracked-tight uppercase text-fg/50 underline underline-offset-4 hover:text-fg"
          >
            ← Volver al sitio
          </a>
        </div>
      </div>
    </div>
  );
}
