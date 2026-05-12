import { Suspense } from "react";
import { Badge, Card, Divider, Text } from "@/design-system/components";
import { CafeHeader } from "@/components/cafe/CafeHeader";

import { ProcessStrip } from "@/components/cafe/ProcessStrip";
import { ShopSkeletons } from "@/components/cafe/ShopItemSkeleton";
import { ProductCarousel } from "@/components/cafe/ProductCarousel";
import type { CafeProduct } from "@/components/cafe/ShopItem";
import { fetchProducts } from "@/types/api";
import Image from "next/image";

export default function CafeHome() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <CafeHeader />

      <main className="px-[var(--space-page-x)] py-[var(--space-page-y)] space-y-6">
        <Hero />

        <Suspense fallback={<ShopSection products={null} />}>
          <ShopAsync />
        </Suspense>

        <Manifesto />

        <div id="proceso">
          <ProcessStrip />
        </div>

        <Story />

        <Divider />

        <Footer />
      </main>
    </div>
  );
}

async function ShopAsync() {
  let products: CafeProduct[] = [];
  try {
    products = await fetchProducts();
  } catch {
    // API unavailable — render empty grid gracefully
  }
  return <ShopSection products={products} />;
}

function Hero() {
  return (
    <section className="rounded-[calc(var(--ui-radius)+8px)] border border-border overflow-hidden grain animate-entry">
      <div className="relative bg-[color:var(--cafe-terracotta)]">
        <div className="absolute inset-0 opacity-[0.10] [mask-image:radial-gradient(70%_60%_at_50%_35%,black,transparent)]">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,.28)_0px,transparent_1px,transparent_3px)]" />
        </div>

        <div className="relative px-[var(--space-page-x)] py-12 md:py-16">
          <div className="max-w-4xl">
            <div className="tracked font-sans text-[11px] uppercase text-[color:color-mix(in_oklab,var(--cafe-paper)_80%,transparent)]">
              Café de altura · Los Yungas, La Paz
            </div>

            <Text
              as="h1"
              variant="display"
              className="mt-3 text-[color:var(--cafe-paper)] leading-[0.92]"
            >
              Café del Rey
            </Text>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[color:color-mix(in_oklab,var(--cafe-paper)_86%,transparent)]">
              Un diseño editorial y táctil, inspirado en la energía tropical de los Yungas.
              Roasting con calma. Café con historia. Sensación en la taza.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Badge className="bg-[color:color-mix(in_oklab,var(--cafe-paper)_14%,transparent)] text-[color:var(--cafe-paper)] border border-[color:color-mix(in_oklab,var(--cafe-paper)_26%,transparent)]">
                Micro-lotes
              </Badge>
              <Badge className="bg-[color:color-mix(in_oklab,var(--cafe-paper)_14%,transparent)] text-[color:var(--cafe-paper)] border border-[color:color-mix(in_oklab,var(--cafe-paper)_26%,transparent)]">
                Tostado artesanal
              </Badge>
              <Badge className="bg-[color:color-mix(in_oklab,var(--cafe-paper)_14%,transparent)] text-[color:var(--cafe-paper)] border border-[color:color-mix(in_oklab,var(--cafe-paper)_26%,transparent)]">
                De finca a taza
              </Badge>
            </div>
          </div>

          <div className="hidden lg:block absolute right-6 top-6">
            <div className="rounded-full border border-[color:color-mix(in_oklab,var(--cafe-paper)_28%,transparent)] bg-[color:color-mix(in_oklab,var(--cafe-paper)_12%,transparent)] px-4 py-2 tracked-tight text-[11px] uppercase text-[color:var(--cafe-paper)]">
              <Image
                src="/LogoREY.png"
                width={250}
                height={250}
                alt="Logo Café del Rey"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShopSection({ products }: { products: CafeProduct[] | null }) {
  return (
    <section
      id="shop"
      className="relative rounded-[calc(var(--ui-radius)+8px)] border border-border overflow-hidden grain"
    >
      <div className="bg-[color:var(--cafe-river)]">
        <div className="px-[var(--space-page-x)] py-8 md:py-10">
          <div className="relative">
            <div className="hidden lg:block absolute -left-10 top-2">
              <div className="vtype tracked font-sans text-[11px] uppercase text-[color:color-mix(in_oklab,var(--cafe-paper)_86%,transparent)]">
                EN NUESTRA TIENDA
              </div>
            </div>
            <div className="hidden lg:block absolute -right-10 top-2">
              <div className="vtype tracked font-sans text-[11px] uppercase text-[color:color-mix(in_oklab,var(--cafe-paper)_86%,transparent)]">
                EN TU TAZA
              </div>
            </div>

            <div className="max-w-4xl">
              <div className="tracked font-sans text-[11px] uppercase text-[color:color-mix(in_oklab,var(--cafe-paper)_86%,transparent)]">
                Tienda
              </div>
              <Text as="h2" variant="h2" className="mt-2 text-[color:var(--cafe-paper)]">
                Cafés sensacionales
              </Text>
              <p className="mt-2 text-sm leading-relaxed text-[color:color-mix(in_oklab,var(--cafe-paper)_86%,transparent)]">
                Micro-lotes de altura. Después, el rabbit hole: molienda, agua, temperatura, ritual.
              </p>
            </div>

            {products === null ? (
              <ShopSkeletons />
            ) : (
              <ProductCarousel products={products} />
            )}

            <div className="mt-6 rounded-[calc(var(--ui-radius)+6px)] border border-[color:color-mix(in_oklab,var(--cafe-paper)_22%,transparent)] bg-[color:color-mix(in_oklab,var(--cafe-paper)_10%,transparent)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="tracked font-sans text-[11px] uppercase text-[color:color-mix(in_oklab,var(--cafe-paper)_86%,transparent)]">
                    Nota de envío
                  </div>
                  <p className="mt-1 text-sm text-[color:color-mix(in_oklab,var(--cafe-paper)_88%,transparent)]">
                    En La Paz coordinamos entrega. Para el resto del país usamos courier (tiempos según destino).
                  </p>
                </div>
                <div className="rounded-full border border-[color:color-mix(in_oklab,var(--cafe-paper)_28%,transparent)] bg-[color:color-mix(in_oklab,var(--cafe-paper)_12%,transparent)] px-4 py-2 tracked-tight text-[11px] uppercase text-[color:var(--cafe-paper)]">
                  Pedidos por DM/WhatsApp
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Manifesto() {
  return (
    <section
      id="historia"
      className="rounded-[calc(var(--ui-radius)+8px)] border border-border overflow-hidden grain"
    >
      <div className="bg-[color:var(--cafe-lilac)]">
        <div className="px-[var(--space-page-x)] py-10 md:py-12">
          <div className="max-w-5xl">
            <div className="tracked font-sans text-[11px] uppercase text-[color:color-mix(in_oklab,var(--cafe-ink)_70%,transparent)]">
              En nuestra mente
            </div>

            <p className="mt-4 font-sans tracked-tight uppercase text-[13px] md:text-[14px] leading-relaxed text-[color:color-mix(in_oklab,var(--cafe-ink)_86%,transparent)]">
              Café del Rey es sensible. Requiere cuidado. Es táctil y a veces incluso trascendental.
              Celebramos las manos que siembran, cuidan, procesan, transportan, tuestan y preparan este café
              antes de que llegue a tu taza. Con cada sorbo, recordamos que el café no es solo una mercancía:
              es una sensación.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <ManifestoChip>Transparencia</ManifestoChip>
              <ManifestoChip>Respeto</ManifestoChip>
              <ManifestoChip>Biodiversidad</ManifestoChip>
              <ManifestoChip>Calma</ManifestoChip>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="rounded-[calc(var(--ui-radius)+8px)] border border-border overflow-hidden">
      <div className="bg-panel">
        <div className="px-[var(--space-page-x)] py-10">
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <Text as="h2" variant="h2">Nuestra historia</Text>
              <p className="mt-2 text-sm leading-relaxed text-fg/80">
                Los Yungas son humedad, ladera, niebla y sol filtrado. Allí el café aprende a ser paciente.
                Nosotros solo continuamos esa paciencia en el tueste.
              </p>

              <div className="mt-5 grid gap-3">
                <Fact k="Origen" v="Los Yungas, La Paz" />
                <Fact k="Altura" v="1,300–1,900 msnm" />
                <Fact k="Perfiles" v="Lavado · Honey · Natural" />
                <Fact k="Enfoque" v="Micro-lotes + consistencia" />
              </div>
            </div>

            <div className="lg:col-span-7">
              <Card className="p-5 bg-muted">
                <div className="grid sm:grid-cols-2 gap-4">
                  <MiniPanel
                    title="Diseño que se siente"
                    desc="Tipografía con carácter, tracking y superficies con grano — como papel y café."
                  />
                  <MiniPanel
                    title="Ciencia sin solemnidad"
                    desc="Parámetros claros (agua, ratio, molienda)… pero con humor y libertad."
                  />
                  <MiniPanel
                    title="Tropical, no cliché"
                    desc="Verde Yungas + terracota + lila. Un trópico editorial."
                  />
                  <MiniPanel
                    title="Listo para escalar"
                    desc="Tokens, componentes y secciones modulares. Cambias marca, no reescribes UI."
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="contacto" className="pb-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 rounded-[calc(var(--ui-radius)+6px)] border border-border bg-panel p-5 grain">
          <div className="tracked font-sans text-[11px] uppercase text-fg/60">Ubicación</div>
          <Text as="h3" variant="h3" className="mt-2">La Paz, Bolivia</Text>
          <p className="mt-2 text-sm text-fg/80 leading-relaxed">
            Entregas coordinadas y puntos de encuentro.
          </p>
          <Divider className="my-4" />
          <div className="tracked font-sans text-[11px] uppercase text-fg/60">Social</div>
          <div className="mt-2 grid gap-2 text-sm">
            <a className="underline underline-offset-4 text-link" href="#">Instagram</a>
            <a className="underline underline-offset-4 text-link" href="#">WhatsApp</a>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-[calc(var(--ui-radius)+6px)] border border-border bg-panel p-5 grain">
          <div className="tracked font-sans text-[11px] uppercase text-fg/60">Contacto</div>
          <Text as="h3" variant="h3" className="mt-2">Pedidos y alianzas</Text>
          <p className="mt-2 text-sm text-fg/80 leading-relaxed">
            Para pedidos, envíanos un mensaje. Para cafeterías/retail (wholesale), armamos lotes y
            perfiles a medida.
          </p>
          <div className="mt-4 rounded-[calc(var(--ui-radius)-4px)] border border-border bg-muted p-4">
            <div className="tracked-tight text-[10px] uppercase text-fg/60">Email</div>
            <a className="mt-1 block text-sm underline underline-offset-4 text-link" href="mailto:hola@cafedelrey.bo">
              hola@cafedelrey.bo
            </a>
          </div>
        </div>

        <div className="sm:col-span-2 lg:col-span-3 rounded-[calc(var(--ui-radius)+6px)] border border-border bg-panel p-5 grain">
          <div className="tracked font-sans text-[11px] uppercase text-fg/60">Colofón</div>
          <p className="mt-2 text-sm text-fg/80 leading-relaxed">
            Inspiración de layout:{" "}
            <a className="underline underline-offset-4 text-link" href="https://touchycoffee.com/" target="_blank" rel="noreferrer">
              touchycoffee.com
            </a>
          </p>
          <Divider className="my-4" />
          <p className="text-sm text-fg/70">© {new Date().getFullYear()} Café del Rey</p>
        </div>
      </div>
    </footer>
  );
}

function ManifestoChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="h-9 px-4 rounded-full border border-[color:color-mix(in_oklab,var(--cafe-ink)_18%,transparent)] bg-[color:color-mix(in_oklab,var(--cafe-paper)_40%,transparent)] tracked-tight text-[11px] uppercase text-[color:color-mix(in_oklab,var(--cafe-ink)_78%,transparent)] inline-flex items-center">
      {children}
    </span>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-[calc(var(--ui-radius)-2px)] border border-border bg-muted p-4">
      <div className="tracked-tight text-[10px] uppercase text-fg/60">{k}</div>
      <div className="mt-1 text-sm text-fg/85">{v}</div>
    </div>
  );
}

function MiniPanel({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-[calc(var(--ui-radius)-2px)] border border-border bg-panel p-4">
      <div className="tracked-tight text-[11px] uppercase text-fg/70">{title}</div>
      <p className="mt-2 text-sm text-fg/80 leading-relaxed">{desc}</p>
    </div>
  );
}
