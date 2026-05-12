import { Text } from "@/design-system/components";
import { ProductTable } from "@/components/admin/ProductTable";
import type { ApiProduct } from "@/types/api";

async function getProducts(): Promise<ApiProduct[]> {
  const base = process.env.API_INTERNAL_URL ?? "http://localhost:8000";
  const res = await fetch(`${base}/products`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function AdminPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div>
        <div className="tracked font-sans text-[11px] uppercase text-fg/50">Dashboard</div>
        <Text as="h1" variant="h2" className="mt-1">Gestión de productos</Text>
        <p className="mt-2 text-sm text-fg/70">
          Aquí puedes actualizar las fotos de cada producto.
        </p>
      </div>

      <ProductTable initialProducts={products} />
    </div>
  );
}
