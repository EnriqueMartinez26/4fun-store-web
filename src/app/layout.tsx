import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AppProviders } from './providers';
import { Inter } from 'next/font/google';
import { PublicShell } from '@/components/layout/public-shell';

export const metadata: Metadata = {
  title: '4Fun | Tu destino gamer',
  description: 'La mejor tienda de videojuegos digitales y físicos. Ofertas increíbles, entrega inmediata y soporte premium.',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'manifest', url: '/site.webmanifest' },
    ],
  },
};

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <AppProviders>
          <PublicShell>{children}</PublicShell>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
