# Acta de Entrega Final y Validación de Despliegue (Hito M6)

Este documento certifica la correcta publicación, configuración y validación en producción de la plataforma académica **4Fun Store**, consolidando formalmente el **Hito M6 (Entrega Final)**.

---

## 1. Ficha Técnica del Despliegue

| Componente                     | Entorno Productivo Académico / Detalle                                 |
| :----------------------------- | :--------------------------------------------------------------------- |
| **Frontend Desplegado**        | [https://4fun-store-web.vercel.app](https://4fun-store-web.vercel.app) |
| **Backend Desplegado**         | [https://4fun-store-api.vercel.app](https://4fun-store-api.vercel.app) |
| **Base de Datos**              | Supabase (PostgreSQL 15)                                               |
| **Rama Git Desplegada**        | `tesis/flujo-principal`                                                |
| **Commit Backend Desplegado**  | `89cd81c`                                                              |
| **Commit Frontend Desplegado** | `52ba307`                                                              |

---

## 2. Matriz de Validación de Despliegue (Smoke Test)

| Caso de Prueba               | Endpoint / Ruta Validada        | Resultado Esperado                                                                   |   Estado   |
| :--------------------------- | :------------------------------ | :----------------------------------------------------------------------------------- | :--------: |
| **Health Check API**         | `/health`                       | Devuelve `{"status":"ok"}` de forma inmediata (lazy connection).                     | ✅ Exitoso |
| **Catálogo Público**         | `/productos`                    | Carga de catálogo con SSR, renderizando videojuegos del seed.                        | ✅ Exitoso |
| **Filtros e Imágenes**       | `/productos?genre=...`          | Las imágenes cargan de Cloudinary y los filtros filtran en cliente/servidor.         | ✅ Exitoso |
| **Autenticación (Cookies)**  | `/api/auth/login`               | Login devuelve token de sesión con atributo `HttpOnly` y `Secure`.                   | ✅ Exitoso |
| **Persistencia de Sesión**   | `/api/auth/profile`             | El refresh del navegador lee la sesión desde la cookie de forma transparente.        | ✅ Exitoso |
| **Carrito y Stock**          | `/cart`                         | Reserva lógica de stock en caliente consultando claves `AVAILABLE` de base de datos. | ✅ Exitoso |
| **Checkout (Generar Orden)** | `/checkout`                     | Genera orden en estado `PENDING` y vacía el carrito en BD.                           | ✅ Exitoso |
| **Marcado de Pago Admin**    | `/api/orders/.../pay`           | El rol administrativo marca `isPaid = true` en producción de forma atómica.          | ✅ Exitoso |
| **Asignación de Keys**       | `/api/keys/assign`              | Las llaves correspondientes pasan a `SOLD` y se vinculan a la orden.                 | ✅ Exitoso |
| **Creación de Escrow**       | `/api/transactions`             | Creación de transacción en custodia con estado `PENDING_APPROVAL`.                   | ✅ Exitoso |
| **Aprobación de Fondos**     | `/api/transactions/.../approve` | El admin libera fondos cambiando el estado de custodia a `FUNDS_RELEASED`.           | ✅ Exitoso |
| **Historial Comprador**      | `/account`                      | Comprador ve su orden pagada e interactúa para revelar las claves asignadas.         | ✅ Exitoso |
| **Consola del Navegador**    | F12 DevTools                    | Cero errores de compilación, de CORS o alertas de vulnerabilidad.                    | ✅ Exitoso |

---

## 3. Configuración de Variables de Entorno en Producción

### Backend (Vercel Project `4fun-store-api`)

- `NODE_ENV`: `production`
- `DATABASE_URL`: URL del pooler de Supabase (puerto 6543 con `pgbouncer=true`).
- `DIRECT_URL`: Conexión directa a Supabase (puerto 5432) para migraciones y PrismaPg.
- `FRONTEND_URL`: `https://4fun-store-web.vercel.app` (CORS configurado para aceptar peticiones exclusivas).
- `BACKEND_URL`: `https://4fun-store-api.vercel.app`
- `DISPUTE_WINDOW_DAYS`: `0` (Parámetro de negocio de tesis para cierres de escrow inmediatos).
- `JWT_SECRET`: Firma simétrica criptográfica de 256 bits.
- `JWT_EXPIRE`: `7d`
- `JWT_COOKIE_EXPIRE`: `30` (Días de expiración de la cookie de sesión).

### Frontend (Vercel Project `4fun-store-web`)

- `NEXT_PUBLIC_API_URL`: `https://4fun-store-api.vercel.app`
- `NEXT_PUBLIC_SUPABASE_URL`: `https://rfcskmjpoponcqjembmv.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Token anónimo para validaciones directas en cliente.

---

## 4. Evidencia Visual e Instrucciones de Auditoría

Para verificar el correcto funcionamiento del despliegue:

1.  Ingresar a [https://4fun-store-web.vercel.app](https://4fun-store-web.vercel.app).
2.  Iniciar sesión con un usuario comprador del seed de prueba.
3.  Efectuar una compra simulada y constatar que el flujo transaccional se propaga hacia el backend en [https://4fun-store-api.vercel.app](https://4fun-store-api.vercel.app) sin errores.
4.  Cualquier anomalía de red o validación puede auditarse directamente a través del panel de control de Vercel.
