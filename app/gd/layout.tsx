import { GDSidebar } from "@/components/gd/layout/GDSidebar";
import { GDTopbar } from "@/components/gd/layout/GDTopbar";
import { GDFooter } from "@/components/gd/layout/GDFooter";
import { Divider } from "@/design-system/components";

export default function GDLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="flex min-h-dvh">
        <GDSidebar />

        {/* min-h-dvh + main con overflow para scroll “tipo dashboard” */}
        <div className="min-w-0 flex-1 flex flex-col min-h-dvh">
          <GDTopbar />

          <main className="min-h-0 flex-1 overflow-y-auto px-[var(--space-page-x)] py-6 space-y-6">
          
            {children}

            <Divider />
            <GDFooter />
          </main>
        </div>
      </div>
    </div>
  );
}