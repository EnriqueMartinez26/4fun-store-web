'use client';

/**
 * Capa de Seguridad (RBAC): Layout de Vendedor
 * --------------------------------------------------------------------------
 * Garantiza que solo los usuarios autorizados (Rol: Seller o Admin) puedan
 * acceder a las herramientas de gestión comercial.
 */

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { Separator } from "@/components/ui/separator";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'SELLER' && user.role !== 'ADMIN') {
        router.push('/account');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
          Verificando credenciales de comercio...
        </p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/5 bg-card/60 backdrop-blur-xl px-4 sticky top-24 z-10">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
        </header>
        
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 xl:p-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
