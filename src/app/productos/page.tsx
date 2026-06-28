import { GameCatalog } from '@/components/game/game-catalog';
import { ProductApiService } from '@/lib/services/ProductApiService';

/**
 * Capa de Presentación: Catálogo Global de Productos (Products Page)
 * --------------------------------------------------------------------------
 * Orquesta la visualización maestra del inventario.
 * Implementa 'Server Side Rendering' (SSR) para la carga inicial hidratada,
 * permitiendo una indexación SEO óptima y una experiencia de carga rápida.
 * (MVC / View-Controller)
 */

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // RN - Navegación: Recupera los criterios de filtrado desde los parámetros de la URL.
  const { genre, platform, search } = await searchParams;

  try {
    /**
     * RN - Hidratación Inicial: Solicita la primera página de productos al Backend.
     * Mantenibilidad: Se utiliza el motor de caché de Next.js (ISR) con revalidación
     * cada 60 segundos para optimizar el rendimiento de la infraestructura.
     */
    const { products, meta } = await ProductApiService.getAll({
      page: 1,
      limit: 9,
      sort: 'order',
      genre: genre as string,
      platform: platform as string,
      search: search as string,
    });

    const games = products.map((p) => p.getRawData());
    const totalPages = meta?.totalPages || 1;

    return (
      <div className="container mx-auto px-4">
        {/* 
            RN - Arquitectura Componentizada: Delega la interactividad del catálogo 
            al Client Component 'GameCatalog', pasando los datos pre-hidratados.
        */}
        <GameCatalog initialGames={games} initialTotalPages={totalPages} />
      </div>
    );
  } catch (error) {
    console.error('[ProductosPage] Error al hidratar el catálogo inicial:', error);

    return (
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-2xl border border-white/10 bg-card/40 p-8 text-center">
          <h1 className="text-2xl font-bold text-white">No pudimos cargar el catálogo</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            El servidor devolvió un error al preparar la vista inicial. Reintentá en unos segundos.
          </p>
        </div>
      </div>
    );
  }
}
