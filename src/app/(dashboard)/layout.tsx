import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--color-background)" }}>
      <Sidebar />
      <div className="flex flex-1 flex-col min-h-0">
        <main id="main-content" className="flex-1 min-h-0 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
