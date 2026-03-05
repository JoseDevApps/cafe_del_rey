import Link from "next/link";
import { cx } from "@/design-system/components/_shared/cx";

export function TopLink({
  item,
  active,
}: {
  item: { label: string; href: string; external?: boolean };
  active?: boolean;
}) {
  const cls = cx(
    "px-3 h-10 inline-flex items-center rounded-[calc(var(--ui-radius)-10px)]",
    "border border-transparent hover:bg-muted",
    active ? "text-primary bg-muted/60" : "text-fg/80"
  );

  if (item.external) {
    return (
      <a className={cls} href={item.href} target="_blank" rel="noreferrer">
        {item.label}
      </a>
    );
  }

  return (
    <Link className={cls} href={item.href}>
      {item.label}
    </Link>
  );
}
