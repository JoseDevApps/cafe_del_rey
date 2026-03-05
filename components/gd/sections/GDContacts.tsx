import { Card, Divider, Text } from "@/design-system/components";

export function GDContacts() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <Text as="h2" variant="h2">
          Contacto
        </Text>
        <Text tone="muted" size="sm">
          Oficinas · AETN
        </Text>
      </div>

      {/* Desktop: compacto (sin empujar altura). Mobile: todo visible */}
      <div className="mt-4 grid lg:grid-cols-12 gap-6">
        {/* IZQ: esenciales */}
        <div className="lg:col-span-5 space-y-3">
          <div className="rounded-[calc(var(--ui-radius)-10px)] border border-border bg-muted p-4">
            <Text tone="muted" size="xs">
              Línea gratuita
            </Text>
            <Text as="div" className="font-display text-lg mt-1 text-primary">
              800 10 2407
            </Text>
          </div>

          <div className="rounded-[calc(var(--ui-radius)-10px)] border border-border bg-muted p-4">
            <Text tone="muted" size="xs">
              Correo
            </Text>
            <a className="text-sm text-link underline underline-offset-4" href="mailto:aetn@aetn.gob.bo">
              aetn@aetn.gob.bo
            </a>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <a className="text-link underline underline-offset-4" href="https://www.facebook.com/aetn.gob.bo" target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a className="text-link underline underline-offset-4" href="https://www.aetn.gob.bo" target="_blank" rel="noreferrer">
              Web AETN
            </a>
          </div>
        </div>

        {/* DER: detalles largos en disclosure (sin JS) */}
        <div className="lg:col-span-7 space-y-3">
          <details className="rounded-[calc(var(--ui-radius)-10px)] border border-border bg-muted p-4">
            <summary className="cursor-pointer font-display text-sm">
              Ver teléfonos y direcciones
            </summary>

            <div className="mt-3 space-y-2 text-sm text-fg/80 leading-relaxed">
              <div><b>La Paz (Central):</b> (591-2) 2312401</div>
              <div><b>La Paz (San Jorge):</b> (591-2) 2430309</div>
              <div><b>Cochabamba:</b> (591-4) 4142100</div>
              <div><b>Santa Cruz:</b> (591-3) 3111291</div>

              <Divider className="my-3" />

              <div><b>La Paz (Central):</b> Av. 16 de Julio N1571, El Prado</div>
              <div><b>La Paz (San Jorge):</b> Av. 6 de Agosto N2905</div>
              <div><b>Santa Cruz:</b> Edif. Millennial Tower N 949; Calle 21 de mayo (entre Busch y Cañada Strongest).</div>
            </div>
          </details>

          <details className="rounded-[calc(var(--ui-radius)-10px)] border border-border bg-muted p-4">
            <summary className="cursor-pointer font-display text-sm text-danger">
              Protección de datos
            </summary>
            <p className="mt-3 text-sm text-fg/80 leading-relaxed">
              Pega aquí el texto legal completo o enlaza a /legal.
            </p>
          </details>
        </div>
      </div>
    </Card>
  );
}