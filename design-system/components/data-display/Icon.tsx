import { cx } from "@/design-system/components/_shared/cx";

type IconProps = {
  /** ReactNode del ícono (componente de librería) */
  children: React.ReactNode;
  /** Tamaños del sistema */
  size?: "xs" | "sm" | "md" | "lg";
  /** Accesibilidad: si es decorativo, aria-hidden */
  label?: string;
  className?: string;
};

const SIZE: Record<NonNullable<IconProps["size"]>, string> = {
  xs: "size-3.5",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

export function Icon({ children, size = "sm", label, className }: IconProps) {
  const ariaProps = label
    ? { role: "img", "aria-label": label }
    : { "aria-hidden": true };

  return (
    <span className={cx("inline-flex items-center justify-center", SIZE[size], className)} {...ariaProps}>
      {children}
    </span>
  );
}