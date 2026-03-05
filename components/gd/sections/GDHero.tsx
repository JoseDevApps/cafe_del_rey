import { Badge, Button, Card, Text } from "@/design-system/components";

export function GDHero() {
  return (
    <Card className="p-5">
      <div className="relative rounded-[calc(var(--ui-radius)-6px)] border border-border">
        {/* Background (solo se recorta el fondo, no el texto) */}
        <div className="overflow-hidden rounded-[calc(var(--ui-radius)-6px)]">
          <div className="min-h-[200px] sm:min-h-[260px] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-primary)_18%,white),white_55%,color-mix(in_oklab,var(--color-secondary)_14%,white))]" />
        </div>

        {/*
          RESPONSIVE LAYOUT:
          - Mobile: contenido en flujo normal (no absolute) => no se recorta
          - md+: contenido absoluto y alineado abajo como “banner”
        */}
        <div className="p-5 sm:p-6 md:absolute md:inset-0 md:p-8 md:flex md:items-end">
          {/* En móvil le damos una “tarjeta” semitransparente para legibilidad */}
          <div className="max-w-3xl space-y-3 rounded-[calc(var(--ui-radius)-10px)] border border-border bg-panel/85 backdrop-blur p-4 sm:p-5 md:p-0 md:bg-transparent md:border-transparent md:backdrop-blur-0">
            <Badge className="bg-panel/90 text-fg border border-border py-1 leading-none">
              AETN · GD
            </Badge>

            {/* ✅ FIX: tamaños + line-height responsivos (evita que se pisen líneas) */}
            <Text
              as="h1"
              variant="display"
              className="tracking-tight leading-[1.08] text-3xl sm:text-4xl md:text-5xl"
            >
              Plantas de Generación Distribuida
            </Text>

            <Text tone="muted" className="max-w-2xl text-sm sm:text-base">
              Landing institucional (skeleton) basado en tokens. Reemplaza el copy por el mensaje oficial.
            </Text>

            {/* Botones: en móvil pueden ocupar todo el ancho si quieres */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button href="/gd" variant="primary" className="w-full sm:w-auto">
                Información General
              </Button>
              <Button
                href="/gd/geovisor"
                variant="ghost"
                className="w-full sm:w-auto bg-panel hover:bg-muted"
              >
                Abrir Geovisor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}