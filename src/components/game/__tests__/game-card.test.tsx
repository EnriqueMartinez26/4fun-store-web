import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { GameCard } from '@/components/game/game-card';
import type { Product } from '@/lib/schemas';

/**
 * GameCard es el componente que se repite en todo el catálogo. Lo que importa
 * verificar es que traduzca fielmente el estado del producto: precio en pesos,
 * insignia de descuento, agotado y tope de stock ya en el carrito.
 *
 * Se mockean next/image y framer-motion porque no aportan comportamiento a
 * verificar y ensucian el DOM en jsdom. Los contextos se mockean para poder
 * controlar el estado del carrito y de la wishlist desde cada test.
 */

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

vi.mock('framer-motion', () => ({
  motion: { div: ({ children }: { children?: ReactNode }) => <div>{children}</div> },
  AnimatePresence: ({ children }: { children?: ReactNode }) => <>{children}</>,
}));

const toggleWishlist = vi.fn();
const addToCart = vi.fn();
let cart: Array<{ productId: string; quantity: number }> = [];
let wishlistIds: string[] = [];

vi.mock('@/context/CartContext', () => ({
  useCart: () => ({ addToCart, cart }),
}));

vi.mock('@/context/WishlistContext', () => ({
  useWishlist: () => ({
    toggleWishlist,
    isInWishlist: (id: string) => wishlistIds.includes(id),
  }),
}));

const buildGame = (overrides: Partial<Product> = {}): Product =>
  ({
    id: 'prod-1',
    name: 'Elden Ring',
    description: 'Un action RPG de mundo abierto de FromSoftware.',
    price: 64999,
    stock: 10,
    type: 'Digital',
    status: 'ACTIVE',
    platform: { id: 'steam', name: 'Steam' },
    genre: { id: 'rpg', name: 'RPG' },
    imageId: 'https://res.cloudinary.com/dxlbwdqop/image/upload/4fun/covers/elden-ring.png',
    ...overrides,
  }) as Product;

/** Normaliza los espacios que Intl inserta (U+00A0 y U+202F). */
const normalize = (value: string) => value.replace(/[  ]/g, ' ');

beforeEach(() => {
  cart = [];
  wishlistIds = [];
  vi.clearAllMocks();
});

describe('GameCard', () => {
  it('muestra el nombre, la plataforma y el precio en pesos', () => {
    render(<GameCard game={buildGame()} />);

    expect(screen.getByRole('heading', { name: 'Elden Ring' })).toBeInTheDocument();
    expect(screen.getByText('Steam')).toBeInTheDocument();
    expect(normalize(document.body.textContent ?? '')).toContain('64.999');
  });

  it('usa la portada del producto como imagen accesible', () => {
    render(<GameCard game={buildGame()} />);

    const portada = screen.getByAltText('Portada de Elden Ring');

    expect(portada).toHaveAttribute(
      'src',
      'https://res.cloudinary.com/dxlbwdqop/image/upload/4fun/covers/elden-ring.png'
    );
  });

  it('muestra la insignia de descuento y tacha el precio original cuando hay oferta', () => {
    render(<GameCard game={buildGame({ price: 10000, discountPercentage: 30 })} />);

    expect(screen.getByText(/-30% OFF/)).toBeInTheDocument();

    const texto = normalize(document.body.textContent ?? '');
    expect(texto).toContain('7.000');
    expect(texto).toContain('10.000');
  });

  it('no muestra insignia de descuento si la oferta venció', () => {
    const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    render(
      <GameCard game={buildGame({ price: 10000, discountPercentage: 30, discountEndDate: ayer })} />
    );

    expect(screen.queryByText(/OFF/)).not.toBeInTheDocument();
    expect(normalize(document.body.textContent ?? '')).toContain('10.000');
  });

  it('marca el producto como agotado y deshabilita el botón de compra', () => {
    render(<GameCard game={buildGame({ status: 'OUT_OF_STOCK', stock: 0 })} />);

    // "Agotado" aparece dos veces a propósito: la insignia del catálogo y el botón.
    expect(screen.getAllByText('Agotado')).toHaveLength(2);
    expect(screen.getByRole('button', { name: /Agotado/ })).toBeDisabled();
  });

  it('bloquea el botón cuando ya se alcanzó el stock disponible en el carrito', () => {
    cart = [{ productId: 'prod-1', quantity: 2 }];

    render(<GameCard game={buildGame({ stock: 2 })} />);

    expect(screen.getByRole('button', { name: /En el Carrito/ })).toBeDisabled();
    expect(addToCart).not.toHaveBeenCalled();
  });

  it('agrega el producto al carrito al hacer click en Añadir', () => {
    const game = buildGame();

    render(<GameCard game={game} />);
    fireEvent.click(screen.getByRole('button', { name: /Añadir/ }));

    expect(addToCart).toHaveBeenCalledWith(game);
  });

  it('alterna la wishlist al hacer click en el corazón', () => {
    const game = buildGame();

    render(<GameCard game={game} />);
    fireEvent.click(screen.getByRole('button', { name: 'Alternar Favorito' }));

    expect(toggleWishlist).toHaveBeenCalledWith(game);
  });
});
