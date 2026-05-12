import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata: Metadata = {
  title: "Panel Admin — Café del Rey",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <AdminHeader />
      <main className="px-[var(--space-page-x)] py-8 max-w-4xl mx-auto">
        {children}
      </main>
    </div>
  );
}
