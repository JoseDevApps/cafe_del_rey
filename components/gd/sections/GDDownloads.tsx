import { Button, Card, Text } from "@/design-system/components";

export function GDDownloads() {
  return (
    <section className="grid lg:grid-cols-2 gap-6">
      <DownloadCard
        title="Cartilla Informativa GD"
        subtitle="Generación Distribuida con Sistemas Solares fotovoltaicos conectados a la red eléctrica"
        href="#"
      />
      <DownloadCard
        title="Procedimientos GD"
        subtitle="Decreto Supremo y documentos de referencia"
        href="#"
      />
    </section>
  );
}

function DownloadCard({ title, subtitle, href }: { title: string; subtitle: string; href: string }) {
  return (
    <Card className="p-5">
      <div className="space-y-4">
        <div className="space-y-1">
          <Text as="h2" variant="h2">
            {title}
          </Text>
          <Text tone="muted" size="sm">
            {subtitle}
          </Text>
        </div>

        {/* no-image placeholder */}
        <div className="rounded-[calc(var(--ui-radius)-6px)] border border-border bg-muted p-5">
          <div className="h-2 w-2/3 rounded bg-[color:color-mix(in_oklab,var(--color-fg)_10%,transparent)]" />
          <div className="mt-3 h-2 w-1/2 rounded bg-[color:color-mix(in_oklab,var(--color-fg)_10%,transparent)]" />
          <div className="mt-6 grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 rounded-[calc(var(--ui-radius)-12px)] border border-border bg-panel" />
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <Button href={href} variant="secondary" target="_blank" rel="noreferrer" download>
            Descargar
          </Button>
        </div>
      </div>
    </Card>
  );
}
