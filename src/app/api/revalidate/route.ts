import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

/**
 * Capa de Infraestructura: Endpoint de Revalidación de Caché (On-Demand ISR)
 * --------------------------------------------------------------------------
 * Invalida el caché estático del Server Component de la home page cuando
 * las taxonomías (Géneros/Plataformas) son modificadas desde el panel Admin.
 * Next.js 15 App Router: revalidatePath() purga el caché de la ruta indicada.
 */

export async function POST() {
  try {
    revalidatePath('/');
    return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ revalidated: false, error: String(err) }, { status: 500 });
  }
}
