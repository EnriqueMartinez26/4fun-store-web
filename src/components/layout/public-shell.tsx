"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const PANEL_PREFIXES = ["/admin", "/seller"];

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPanel = PANEL_PREFIXES.some((p) => pathname.startsWith(p));

  if (isPanel) return <>{children}</>;

  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
