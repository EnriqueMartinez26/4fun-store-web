# Alcance del Proyecto: 4Fun Store Web

Este documento define los límites funcionales y no funcionales del frontend del proyecto e-commerce académico **4Fun Store Web**, desarrollado en el marco de la tesis de la Tecnicatura en Programación.

## Objetivos del Sistema Frontend

La interfaz de usuario ha sido concebida para interactuar con la API REST del backend de manera robusta y segura, cumpliendo con los estándares modernos de desarrollo de aplicaciones web de una sola página (SPA/SSR) utilizando Next.js.

## Módulos Incluidos en el Alcance

### 1. Autenticación y Autorización

- **Inicio de Sesión y Registro**: Formularios con validación en cliente (Zod + React Hook Form).
- **Seguridad de la Sesión**: Integración exclusiva mediante cookies HttpOnly (mecanismo de transporte seguro).
- **Gestión de Perfiles y Roles**: Soporte para vistas de comprador y paneles de administración de acuerdo con el rol de la identidad autenticada.

### 2. Catálogo de Videojuegos Digitales

- **Navegación e Interacción**: Filtros por plataforma, género, precio y búsqueda textual.
- **Sincronización con la URL**: Los parámetros de búsqueda se mapean dinámicamente a la URL para permitir enlaces compartibles y soporte nativo al botón atrás del navegador.
- **Detalle de Productos**: Ficha de información detallada, precio, plataforma de distribución y stock actual.

### 3. Carrito de Compras

- **Persistencia Híbrida**: Almacenamiento local temporal (`localStorage`) para usuarios anónimos y sincronización en tiempo real vía API para usuarios autenticados.
- **Validaciones de Integridad**: Control de stock antes de añadir al carrito para prevenir sobreventa en caliente.

### 4. Gestión de Órdenes y Checkout

- **Generación de Pedidos**: Confirmación de la orden desde el carrito y generación del registro histórico.
- **Historial de Compras**: Consulta histórica para el usuario comprador.

### 5. Panel de Administración

- **Gestión Simplificada**: Dashboard para operaciones básicas (mantenimiento del catálogo, auditoría de órdenes) requeridas para la validación integral del flujo del sistema.

---

## Elementos Fuera de Alcance

1.  **Productos Físicos**: El catálogo está estrictamente acotado a la venta de claves o licencias de videojuegos digitales. No se incluye control logístico, despachos físicos ni envíos postales.
2.  **Integración de Pasarelas de Pago Reales**: El procesamiento de pagos mediante MercadoPago está modelado a nivel transaccional y simulado (Mock/Simulador de flujo) para evitar cargos monetarios reales durante la defensa de tesis.
3.  **Gestión Multimoneda Dinámica**: Los importes están fijos a la moneda local especificada en el backend.
