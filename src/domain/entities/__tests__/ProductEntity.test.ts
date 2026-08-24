import { describe, expect, it } from 'vitest';
import { FALLBACK_IMAGE, ProductEntity } from '@/domain/entities/ProductEntity';
import type { Product } from '@/lib/schemas';

/**
 * ProductEntity concentra las reglas de negocio que la UI no debe recalcular:
 * vigencia del descuento, disponibilidad y fallback de imagen. Los tests van
 * contra esas reglas, no contra los getters triviales.
 */

const DAY = 24 * 60 * 60 * 1000;
const inThePast = () => new Date(Date.now() - DAY).toISOString();
const inTheFuture = () => new Date(Date.now() + DAY).toISOString();

/** Normaliza los espacios que Intl inserta (U+00A0 y U+202F) para poder comparar. */
const normalize = (value: string) => value.replace(/[  ]/g, ' ');

const buildProduct = (overrides: Partial<Product> = {}): Product =>
  ({
    id: 'prod-1',
    name: 'Elden Ring',
    description: 'Un action RPG de mundo abierto de FromSoftware.',
    price: 64999,
    stock: 10,
    type: 'Digital',
    ...overrides,
  }) as Product;

describe('ProductEntity — precondiciones del contrato', () => {
  it('rechaza un producto sin id', () => {
    expect(() => new ProductEntity(buildProduct({ id: '' }))).toThrow(/id is required/);
  });

  it('rechaza un producto sin nombre', () => {
    expect(() => new ProductEntity(buildProduct({ name: '' }))).toThrow(/name is required/);
  });

  it('rechaza un precio negativo', () => {
    expect(() => new ProductEntity(buildProduct({ price: -1 }))).toThrow(
      /price cannot be negative/
    );
  });
});

describe('ProductEntity — vigencia del descuento', () => {
  it('aplica el porcentaje cuando no hay fecha de fin', () => {
    const product = new ProductEntity(buildProduct({ price: 10000, discountPercentage: 25 }));

    expect(product.getDiscountedPrice()).toBe(7500);
    expect(product.isOnDiscount()).toBe(true);
  });

  it('aplica el porcentaje si la fecha de fin todavía no pasó', () => {
    const product = new ProductEntity(
      buildProduct({ price: 10000, discountPercentage: 25, discountEndDate: inTheFuture() })
    );

    expect(product.getDiscountedPrice()).toBe(7500);
    expect(product.isOnDiscount()).toBe(true);
  });

  it('ignora el descuento vencido y cobra el precio de lista', () => {
    const product = new ProductEntity(
      buildProduct({ price: 10000, discountPercentage: 25, discountEndDate: inThePast() })
    );

    expect(product.getDiscountedPrice()).toBe(10000);
    expect(product.isOnDiscount()).toBe(false);
  });

  it('trata el descuento en 0 como ausencia de descuento', () => {
    const product = new ProductEntity(buildProduct({ price: 10000, discountPercentage: 0 }));

    expect(product.getDiscountedPrice()).toBe(10000);
    expect(product.isOnDiscount()).toBe(false);
  });
});

describe('ProductEntity — formato monetario', () => {
  it('formatea en pesos argentinos', () => {
    const product = new ProductEntity(buildProduct({ price: 64999 }));

    const formatted = normalize(product.getDisplayPrice());

    expect(formatted).toContain('$');
    expect(formatted).toContain('64.999');
  });

  it('el precio mostrado refleja el descuento y el original no', () => {
    const product = new ProductEntity(buildProduct({ price: 10000, discountPercentage: 50 }));

    expect(normalize(product.getDisplayPrice())).toContain('5.000');
    expect(normalize(product.getOriginalPrice())).toContain('10.000');
  });
});

describe('ProductEntity — fallback de imagen', () => {
  it('usa el fallback propio cuando no hay imagen', () => {
    const product = new ProductEntity(buildProduct({ imageId: null }));

    expect(product.getImageUrl()).toBe(FALLBACK_IMAGE);
  });

  it('usa el fallback cuando la imagen no es una URL ni una ruta absoluta', () => {
    const product = new ProductEntity(buildProduct({ imageId: 'portada.png' }));

    expect(product.getImageUrl()).toBe(FALLBACK_IMAGE);
  });

  it('respeta una URL absoluta', () => {
    const url = 'https://res.cloudinary.com/dxlbwdqop/image/upload/4fun/covers/elden-ring.png';
    const product = new ProductEntity(buildProduct({ imageId: url }));

    expect(product.getImageUrl()).toBe(url);
  });

  it('respeta una ruta que arranca en /', () => {
    const product = new ProductEntity(buildProduct({ imageId: '/covers/elden-ring.png' }));

    expect(product.getImageUrl()).toBe('/covers/elden-ring.png');
  });

  it('el fallback apunta a Cloudinary y no a un servicio externo de placeholders', () => {
    expect(FALLBACK_IMAGE).toContain('res.cloudinary.com');
    expect(FALLBACK_IMAGE).not.toContain('placehold.co');
  });
});

describe('ProductEntity — disponibilidad', () => {
  it('el status manda por encima del stock', () => {
    const activo = new ProductEntity(buildProduct({ status: 'ACTIVE', stock: 0 }));
    const suspendido = new ProductEntity(buildProduct({ status: 'SUSPENDED', stock: 99 }));

    expect(activo.isAvailable()).toBe(true);
    expect(suspendido.isAvailable()).toBe(false);
  });

  it('sin status, se resuelve por stock y por la bandera active', () => {
    const conStock = new ProductEntity(buildProduct({ stock: 3 }));
    const sinStock = new ProductEntity(buildProduct({ stock: 0 }));
    const desactivado = new ProductEntity(buildProduct({ stock: 3, active: false }));

    expect(conStock.isAvailable()).toBe(true);
    expect(sinStock.isAvailable()).toBe(false);
    expect(desactivado.isAvailable()).toBe(false);
  });
});

describe('ProductEntity — estado de stock para la UI', () => {
  it.each([
    [0, 'out'],
    [1, 'low'],
    [5, 'low'],
    [6, 'available'],
  ])('con stock %i devuelve "%s"', (stock, esperado) => {
    const product = new ProductEntity(buildProduct({ stock: stock as number }));

    expect(product.getStockStatus()).toBe(esperado);
  });
});
