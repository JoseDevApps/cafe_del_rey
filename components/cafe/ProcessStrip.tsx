import { Text } from "@/design-system/components";

const steps = [
  { k: "01", title: "Sombra", desc: "Café crece bajo árboles — biodiversidad Yungas." },
  { k: "02", title: "Flor", desc: "Pequeñas flores blancas, olor a jazmín." },
  { k: "03", title: "Cereza", desc: "Cosecha selectiva: solo maduro." },
  { k: "04", title: "Beneficio", desc: "Lavado / Honey / Natural según lote." },
  { k: "05", title: "Secado", desc: "Paciencia + aire: azúcar se ordena." },
  { k: "06", title: "Tueste", desc: "Tostado con calma, sin prisa." },
  { k: "07", title: "Taza", desc: "Tu ritual. Tu mañana. Tu pausa." },
];

export function ProcessStrip() {
  return (
    <section className="rounded-[calc(var(--ui-radius)+6px)] border border-border overflow-hidden grain">
      <div className="bg-[color:var(--cafe-yungas)] text-[color:var(--cafe-paper)]">
        <div className="px-[var(--space-page-x)] py-10">
          <div className="max-w-4xl">
            <div className="tracked font-sans text-[11px] uppercase text-[color:color-mix(in_oklab,var(--cafe-paper)_75%,transparent)]">
              De los Yungas a tu taza
            </div>
            <Text as="h2" variant="display" className="mt-2 text-[color:var(--cafe-paper)]">
              Un viaje breve, una ciencia larga.
            </Text>
            <p className="mt-2 text-sm leading-relaxed text-[color:color-mix(in_oklab,var(--cafe-paper)_82%,transparent)]">
              El café no es un producto: es un proceso vivo. Cada paso deja huellas en el sabor.
            </p>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {steps.map((s) => (
              <div
                key={s.k}
                className="rounded-[calc(var(--ui-radius)+2px)] border border-[color:color-mix(in_oklab,var(--cafe-paper)_20%,transparent)] bg-[color:color-mix(in_oklab,var(--cafe-yungas)_85%,black)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="tracked-tight text-[10px] uppercase text-[color:color-mix(in_oklab,var(--cafe-paper)_78%,transparent)]">
                    {s.k}
                  </div>
                  <div className="h-8 w-8 rounded-full border border-[color:color-mix(in_oklab,var(--cafe-paper)_22%,transparent)] grid place-items-center">
                    ✳
                  </div>
                </div>
                <div className="mt-3 font-display text-xl leading-tight">{s.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-[color:color-mix(in_oklab,var(--cafe-paper)_78%,transparent)]">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
