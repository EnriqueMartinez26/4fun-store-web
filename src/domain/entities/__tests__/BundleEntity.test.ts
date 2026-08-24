import { describe, expect, it } from 'vitest';
import { BundleEntity } from '@/domain/entities/BundleEntity';
import { ProductEntity } from '@/domain/entities/ProductEntity';
import type { Product } from '@/lib/schemas';

/**
 * BundleEntity es el nodo compuesto del patrón Composite: su valor está en que
 * un paquete se comporta como un producto. Los tests verifican esa equivalencia,
 * la semántica AND de la disponibilidad y la inmutabilidad prometida por add().
 */

const buildProduct = (overrides: Partial<Product> = {}): Product =>
  ({
    id: 'prod-1',
    name: 'Portal 2',
    description: 'Puzles en primera persona de Valve.',
    price: 10000,
    stock: 5,
    type: 'Digital',
    ...overrides,
  }) as Product;

const producto = (overrides: Partial<Product> = {}) => new ProductEntity(buildProduct(overrides));

describe('BundleEntity — precondiciones del contrato', () => {
  it('rechaza un bundle sin componentes', () => {
    expect(() => new BundleEntity('bundle-1', 'Pack Valve', [])).toThrow(/at least one component/);
  });

  it('rechaza un bundle sin id', () => {
    expect(() => new BundleEntity('', 'Pack Valve', [producto()])).toThrow(/id is required/);
  });

  it.each([-1, 101])('rechaza un descuento fuera de [0,100] (%i)', (discount) => {
    expect(() => new BundleEntity('bundle-1', 'Pack Valve', [producto()], discount)).toThrow(
      /discountPercentage/
    );
  });
});

describe('BundleEntity — precio del paquete', () => {
  it('suma los componentes y aplica el descuento del bundle', () => {
    const bundle = new BundleEntity(
      'bundle-1',
      'Pack Valve',
      [producto({ id: 'a', price: 10000 }), producto({ id: 'b', price: 30000 })],
      10
    );

    expect(bundle.getDiscountedPrice()).toBe(36000);
  });

  it('parte del precio YA descontado de cada componente, no del de lista', () => {
    const bundle = new BundleEntity(
      'bundle-1',
      'Pack Valve',
      [
        producto({ id: 'a', price: 10000, discountPercentage: 50 }),
        producto({ id: 'b', price: 10000 }),
      ],
      0
    );

    expect(bundle.getDiscountedPrice()).toBe(15000);
  });

  it('nunca sale más caro que la suma de sus partes', () => {
    const componentes = [producto({ id: 'a', price: 10000 }), producto({ id: 'b', price: 20000 })];
    const bundle = new BundleEntity('bundle-1', 'Pack Valve', componentes, 25);

    const sumaIndividual = componentes.reduce((total, c) => total + c.getDiscountedPrice(), 0);

    expect(bundle.getDiscountedPrice()).toBeLessThanOrEqual(sumaIndividual);
  });
});

describe('BundleEntity — disponibilidad con semántica AND', () => {
  it('está disponible sólo si TODOS los componentes lo están', () => {
    const bundle = new BundleEntity('bundle-1', 'Pack Valve', [
      producto({ id: 'a', status: 'ACTIVE' }),
      producto({ id: 'b', status: 'ACTIVE' }),
    ]);

    expect(bundle.isAvailable()).toBe(true);
  });

  it('un solo componente agotado deja el paquete no disponible', () => {
    const bundle = new BundleEntity('bundle-1', 'Pack Valve', [
      producto({ id: 'a', status: 'ACTIVE' }),
      producto({ id: 'b', status: 'OUT_OF_STOCK' }),
    ]);

    expect(bundle.isAvailable()).toBe(false);
  });
});

describe('BundleEntity — inmutabilidad', () => {
  it('add() devuelve un bundle nuevo y no toca el original', () => {
    const original = new BundleEntity('bundle-1', 'Pack Valve', [producto({ id: 'a' })]);

    const ampliado = original.add(producto({ id: 'b' }));

    expect(ampliado).not.toBe(original);
    expect(original.getComponentCount()).toBe(1);
    expect(ampliado.getComponentCount()).toBe(2);
  });

  it('getChildren() devuelve una copia: mutarla no altera el bundle', () => {
    const bundle = new BundleEntity('bundle-1', 'Pack Valve', [producto({ id: 'a' })]);

    bundle.getChildren().push(producto({ id: 'intruso' }));

    expect(bundle.getComponentCount()).toBe(1);
  });

  it('el array pasado al constructor se copia: mutarlo después no afecta al bundle', () => {
    const componentes = [producto({ id: 'a' })];
    const bundle = new BundleEntity('bundle-1', 'Pack Valve', componentes);

    componentes.push(producto({ id: 'intruso' }));

    expect(bundle.getComponentCount()).toBe(1);
  });
});

describe('BundleEntity — se comporta como un producto (Composite)', () => {
  it('expone el mismo contrato que ProductEntity', () => {
    const bundle = new BundleEntity('bundle-1', 'Pack Valve', [producto()]);

    expect(bundle.getId()).toBe('bundle-1');
    expect(bundle.getDisplayName()).toBe('Pack Valve');
    expect(bundle.getDisplayType()).toBe('Bundle');
    expect(typeof bundle.getDisplayPrice()).toBe('string');
  });

  it('sin imagen propia toma la del primer componente', () => {
    const url = 'https://res.cloudinary.com/dxlbwdqop/image/upload/4fun/covers/portal-2.png';
    const bundle = new BundleEntity('bundle-1', 'Pack Valve', [
      producto({ id: 'a', imageId: url }),
      producto({ id: 'b' }),
    ]);

    expect(bundle.getImageUrl()).toBe(url);
  });

  it('la imagen propia gana sobre la del primer componente', () => {
    const propia = 'https://res.cloudinary.com/dxlbwdqop/image/upload/4fun/covers/pack.png';
    const bundle = new BundleEntity(
      'bundle-1',
      'Pack Valve',
      [producto({ id: 'a', imageId: 'https://example.com/otra.png' })],
      10,
      propia
    );

    expect(bundle.getImageUrl()).toBe(propia);
  });
});
