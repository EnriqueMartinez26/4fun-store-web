"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ProductDetail] Error boundary:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <div className="rounded-2xl border border-white/10 bg-card/40 p-8 text-center space-y-5">
        <h1 className="text-3xl font-headline font-bold text-white">¡Uy! Algo no salió como esperábamos</h1>
        <p className="text-muted-foreground">
          Tuvimos un pequeño problema al cargar los detalles de este producto. No te preocupes: ya estamos trabajando para que todo vuelva a la normalidad.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => reset()} className="font-semibold uppercase tracking-wider text-xs">
            Reintentar
          </Button>
          <Button asChild variant="outline" className="font-semibold uppercase tracking-wider text-xs border-white/10">
            <Link href="/productos">Volver al catalogo</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
