import Link from "next/link";
import { cx } from "@/design-system/components/_shared/cx";

export function SidebarLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "block px-3 py-2 rounded-[calc(var(--ui-radius)-12px)] text-sm",
        active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/6 hover:text-white"
      )}
    >
      {children}
    </Link>
  );
}
