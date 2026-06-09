# 4Fun Store Web

Cliente web para 4Fun Store, un sistema e-commerce académico orientado a la venta de videojuegos digitales. La aplicación permite explorar el catálogo, gestionar carrito, iniciar sesión, crear órdenes y consumir los servicios expuestos por la API backend.

## Alcance del proyecto

Este frontend forma parte de una tesis de Tecnicatura en Programación. Su objetivo es demostrar la construcción de una interfaz web moderna conectada a una API REST, con manejo de estado, validaciones, autenticación, navegación por catálogo y flujo de compra.

## Funcionalidades principales

- Página de inicio con taxonomías de productos.
- Catálogo de videojuegos digitales.
- Filtros por plataforma, género, búsqueda y precio.
- Detalle de producto.
- Registro e inicio de sesión.
- Manejo de sesión autenticada.
- Carrito de compras.
- Creación de órdenes.
- Panel administrativo para gestión básica.
- Validación de formularios.
- Manejo de estados de carga y errores.

## Tecnologías

- Next.js
- React
- TypeScript
- Tailwind CSS
- Radix UI
- React Hook Form
- Zod
- Vitest
- Testing Library

## Arquitectura

La aplicación se organiza en capas:

- **app**: rutas y páginas de Next.js.
- **components**: componentes visuales reutilizables.
- **context**: estados globales como autenticación y carrito.
- **hooks**: lógica reutilizable del cliente.
- **lib**: transporte HTTP, servicios y tipos.
- **domain**: entidades y reglas de representación del dominio.

## Integración con backend

El frontend consume la API REST de 4Fun Store API.

Variable principal:

```bash
NEXT_PUBLIC_API_URL=http://localhost:9003
```

Las requests autenticadas deben enviarse con credenciales para permitir el uso de cookies HttpOnly emitidas por el backend.

## Instalación

```bash
npm install
npm run dev
```

La aplicación queda disponible en:
http://localhost:9002

## Scripts

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Genera el bundle optimizado para producción.
- `npm run lint`: Ejecuta el análisis estático del código (ESLint).
- `npm run typecheck`: Valida la consistencia de tipos de TypeScript.
- `npm run test`: Ejecuta las pruebas unitarias e integración con Vitest.

## Flujo principal

1. El usuario ingresa al sitio.
2. Explora el catálogo.
3. Filtra productos.
4. Consulta el detalle de un videojuego.
5. Inicia sesión.
6. Agrega productos al carrito.
7. Crea una orden.
8. Consulta su historial de compras.

## Pruebas

Las pruebas se enfocan en componentes y lógica crítica:

- Formularios de autenticación.
- Carrito.
- Catálogo.
- Servicios HTTP.
- Validaciones de dominio.

## Limitaciones académicas

- El sistema está orientado a demostrar un flujo académico completo.
- El pago puede estar simulado según la configuración del backend.
- El panel administrativo se limita a las funciones necesarias para validar el flujo principal.
- La aplicación depende de la API backend para operar correctamente.
