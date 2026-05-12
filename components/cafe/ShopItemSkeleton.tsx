import { cx } from "@/design-system/components/_shared/cx";

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        "animate-pulse rounded-[calc(var(--ui-radius)-4px)] bg-[color:color-mix(in_oklab,var(--cafe-paper)_28%,transparent)]",
        className
      )}
    />
  );
}

export function ShopItemSkeleton() {
  return (
    <article className="rounded-[calc(var(--ui-radius)+4px)] border border-[color:color-mix(in_oklab,var(--cafe-paper)_22%,transparent)] bg-[color:color-mix(in_oklab,var(--cafe-paper)_10%,transparent)] p-4">
      <Bone className="aspect-[11/12] w-full" />
      <div className="mt-4 space-y-3">
        <Bone className="h-3 w-1/3" />
        <Bone className="h-5 w-2/3" />
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-4/5" />
        <div className="flex gap-2 pt-1">
          <Bone className="h-8 w-16 rounded-full" />
          <Bone className="h-8 w-16 rounded-full" />
          <Bone className="h-8 w-16 rounded-full" />
        </div>
        <div className="flex gap-2 pt-2">
          <Bone className="h-10 w-24 rounded-full" />
          <Bone className="h-10 flex-1 rounded-full" />
        </div>
      </div>
    </article>
  );
}

export function ShopSkeletons() {
  return (
    <div className="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <ShopItemSkeleton key={i} />
      ))}
    </div>
  );
}
