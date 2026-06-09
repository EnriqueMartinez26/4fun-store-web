# 4Fun Store Web

Cliente web SPA para un sistema e-commerce académico orientado a la venta de videojuegos digitales. El proyecto implementa una interfaz de usuario interactiva y responsiva para la navegación del catálogo de productos, carrito de compras, comparador de videojuegos, proceso de checkout simulado e historial de claves digitales de compras realizadas.

## Alcance del proyecto

Este cliente web forma parte de un proyecto de tesis de Tecnicatura en Programación. Su objetivo es demostrar el análisis, diseño e implementación de un frontend robusto con arquitectura desacoplada, gestión de estados complejos, interfaces dinámicas de usuario y separación de responsabilidades entre la capa de interfaz y de lógica de negocio.

El sistema se enfoca exclusivamente en videojuegos digitales. La experiencia del usuario se centra en la simulación guiada de la adquisición de licencias y acceso a su respectivo stock de claves.

### Funcionalidades principales

- Registro de cuentas, inicio de sesión y autenticación persistente.
- Catálogo dinámico de videojuegos con filtros interactivos por género y plataforma.
- Buscador global rápido integrado en un diálogo dedicado.
- Ficha detallada de productos con especificaciones técnicas, valoraciones y reseñas de usuarios.
- Herramienta de comparación técnica lado a lado de hasta 3 videojuegos simultáneos.
- Carrito de compras reactivo y wishlist persistente localmente.
- Proceso de checkout guiado y simulado.
- Perfil de usuario con historial de órdenes y visualización de claves digitales adquiridas.
- Panel administrativo interactivo para la gestión de productos, carga de stock de claves, administración de usuarios y métricas agregadas de negocio.

## Arquitectura

El frontend está desarrollado bajo una arquitectura orientada a la separación estricta de responsabilidades utilizando el patrón **ViewModel (MVVM)** para aislar la lógica de la vista:

- **Views (Vistas)**: Componentes funcionales en React estructurados en directorios de Next.js (App Router). Solo se encargan del renderizado de interfaz y la canalización de eventos.
- **ViewModels (Modelos de Vista)**: Capa intermedia estructurada mediante custom hooks o clases que gestiona el estado local, validaciones operativas (ej. stock, límites) y la interacción directa con la API.
- **Services (Servicios / Cliente API)**: Clientes de red parametrizados (Axios) responsables de establecer comunicación con la API REST de `4fun-store-api`.

Flujo de datos:
`Usuario → Vista (React Component) → ViewModel (Hook/State) → Service (Axios) → Backend API`

## Tecnologías

- Next.js 15 (App Router, Turbopack)
- React 18
- TypeScript 5
- Tailwind CSS 3.4
- Radix UI
- Lucide React
- Axios
- Recharts
- Vitest

## Estructura del proyecto

```
4fun-store-web/src/
├── app/                  # Directorio de rutas de Next.js
│   ├── account/          # Perfil de usuario e historial
│   ├── admin/            # Dashboard administrativo y ABM
│   ├── cart/             # Carrito de compras
│   ├── checkout/         # Flujo de pago simulado
│   ├── comparar/         # Vista del comparador técnico
│   └── productos/        # Catálogo general y detalle de juego
├── components/           # Componentes UI reutilizables
├── context/              # Contextos globales de React (Carrito, Comparador, Wishlist)
├── hooks/                # ViewModels e interceptores customizados
└── lib/                  # Utilidades y definición de cliente API (Axios)
```

## Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto para conectar el cliente con el backend de desarrollo:

```env
NEXT_PUBLIC_API_URL=http://localhost:9003/api
```

## Instalación

```bash
npm install
```

## Ejecución

### Modo desarrollo (Turbopack)

```bash
npm run dev
```

La aplicación queda disponible localmente en:
`http://localhost:9002`

### Producción

```bash
npm run build
npm run start
```

## Pruebas

```bash
npm run test
```

Las pruebas unitarias y de interfaz están implementadas con **Vitest** y **React Testing Library**, cubriendo componentes lógicos interactivos como el comparador y las utilidades críticas de la UI.

## Limitaciones académicas

- El flujo de checkout modela y simula las transacciones bancarias, redirigiendo a vistas de éxito/fallo simuladas. No interactúa con cuentas de dinero productivas ni tarjetas reales.
- Dependencia estricta de la accesibilidad de la API backend para la sincronización de sesiones y persistencia profunda de datos.
- Persistencia local temporal para carritos de usuarios no registrados mediante `localStorage`.

## Mejoras futuras

- Integración productiva final con webhooks de MercadoPago u otra pasarela real.
- Gráficos avanzados y reportes de exportación en múltiples formatos para administradores.
- Implementación de pruebas E2E (End-to-End) con herramientas como Playwright o Cypress.
