# Integración con la API REST: 4Fun Store Web

Este documento describe la estrategia de comunicación entre la aplicación Next.js y el servidor backend de **4Fun Store API**.

## Configuración y Variables de Entorno

La comunicación externa se orquesta mediante la variable de entorno expuesta al cliente:

```bash
NEXT_PUBLIC_API_URL=http://localhost:9003
```

### Configuración del Servidor Next.js (Anti-CORS Rewrite)

Para resolver problemas de origen cruzado (CORS) y permitir el manejo nativo de cookies seguras, se configuró un túnel de reescritura en `next.config.ts`:

```typescript
async rewrites() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9003';
  return [
    {
      source: '/api/:path*',
      destination: `${backendUrl}/api/:path*`,
    },
  ];
}
```

De esta manera, todas las llamadas iniciadas desde el cliente hacia `/api/*` se canalizan internamente al puerto del backend sin activar restricciones de CORS del navegador.

## Estrategia de Autenticación por Cookies HttpOnly

Se eliminó por completo el uso de tokens JWT dentro del almacenamiento persistente expuesto de JS (`localStorage` / `sessionStorage`) para mitigar vulnerabilidades de inyección de script de sitio cruzado (XSS).

1.  **Establecimiento**: Al iniciar sesión (`/auth/login`) o registrarse (`/auth/register`), el backend emite una cookie de sesión cifrada marcada como `HttpOnly`, `Secure` (en producción) y `SameSite=None` en producción o `Lax` en desarrollo.
2.  **Transporte**: Cada petición iniciada en el frontend mediante `HttpTransport` incluye de forma explícita la directiva `credentials: 'include'`:
    ```typescript
    const response = await fetch(url, { ...options, credentials: 'include', headers });
    ```
    Esto le indica al navegador que debe adjuntar la cookie de autenticación de manera automática y segura.
3.  **Cierre de Sesión**: La acción de `logout` efectúa una petición de tipo POST hacia `/auth/logout`, instruyendo al servidor a invalidar la cookie del lado del servidor mientras se purga el estado en caliente del frontend.

## Gestión de Endpoints Utilizados

| Recurso           | Ruta de API       | Método     | Descripción                                              |
| :---------------- | :---------------- | :--------- | :------------------------------------------------------- |
| **Autenticación** | `/auth/login`     | POST       | Valida credenciales e inicializa la cookie de sesión.    |
|                   | `/auth/register`  | POST       | Registra un nuevo usuario en la base de datos.           |
|                   | `/auth/profile`   | GET        | Recupera los detalles y rol de la identidad autenticada. |
|                   | `/auth/logout`    | POST       | Invalida la cookie y finaliza la sesión activa.          |
| **Productos**     | `/products`       | GET        | Recupera el listado paginado y filtrado de videojuegos.  |
|                   | `/products/:id`   | GET        | Obtiene el detalle de un juego digital específico.       |
| **Carrito**       | `/cart`           | GET        | Obtiene el carrito sincronizado del usuario autenticado. |
|                   | `/cart/items`     | POST       | Inserta un producto validando los límites de stock.      |
|                   | `/cart/items/:id` | PUT/DELETE | Modifica la cantidad o remueve un ítem de la cesta.      |
| **Órdenes**       | `/orders`         | POST       | Genera un pedido nuevo a partir del carrito activo.      |
|                   | `/orders`         | GET        | Recupera el historial transaccional de compras.          |
