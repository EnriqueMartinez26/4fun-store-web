# Acta de Cierre Funcional del Flujo Principal (Hito M2)

Este documento certifica y documenta la validación de extremo a extremo (E2E) del flujo principal del sistema e-commerce académico **4Fun Store** para videojuegos digitales, completando formalmente el Hito M2.

---

## 1. Tabla Resumen del Hito M2

| Paso        | Caso de Uso                  | Backend  | Frontend | Evidencia de Validación                               |   Estado   |
| :---------- | :--------------------------- | :------: | :------: | :---------------------------------------------------- | :--------: |
| **Paso 1**  | Seed mínimo de datos         | Aprobado |   N/A    | Script seed y `DISPUTE_WINDOW_DAYS=0` en `.env`       | ✅ Cerrado |
| **Paso 2**  | Registro y Login            | Aprobado | Aprobado | Alta de usuario, verificación de email y sesión autenticada en frontend | ✅ Cerrado |
| **Paso 3**  | Catálogo Digital             | Aprobado | Aprobado | Filtros de catálogo, URL e interacción real en UI     | ✅ Cerrado |
| **Paso 4**  | Carrito y Stock Digital      | Aprobado | Aprobado | Validación de stock y bloqueo de sobrestock           | ✅ Cerrado |
| **Paso 5**  | Generación de Orden          | Aprobado | Aprobado | Creación de orden `PENDING` y vaciado de carrito      | ✅ Cerrado |
| **Paso 6**  | Pago Simulado/Admin          | Aprobado | Aprobado | Orden marcada como pagada sin keys ni escrow          | ✅ Cerrado |
| **Paso 7**  | Asignación de Key Digital    | Aprobado |   N/A    | Llaves vinculadas a orden en estado `SOLD`            | ✅ Cerrado |
| **Paso 8**  | Transacción en Custodia      | Aprobado |   N/A    | Creación de escrow en estado `PENDING_APPROVAL`       | ✅ Cerrado |
| **Paso 9**  | Aprobación/Rechazo Admin     | Aprobado |   N/A    | Aprobación de fondos y rechazo auditado               | ✅ Cerrado |
| **Paso 10** | Historial Comprador          | Aprobado | Aprobado | Órdenes y keys visibles y unmasked en cuenta          | ✅ Cerrado |

---

## 2. Notas de Trazabilidad y Diseño Académico

> [!IMPORTANT]
> **Nota de trazabilidad de IDs**: Las validaciones de backend y de interfaz de usuario (UI) fueron ejecutadas en sesiones de prueba independientes pero funcionalmente equivalentes, utilizando el mismo seed de base de datos y la misma lógica del flujo. La orden canónica de referencia para la continuidad de los scripts del backend es `727f4b4e-3681-4b9b-a06c-17b11d75275f`.

> [!NOTE]
> **Nota de dominio de estados**: En el modelo de dominio de este sistema, `Order.status` representa el estado operativo/logístico de la orden (por ejemplo, `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED` o `CANCELLED`), mientras que `isPaid` y `Transaction.status` representan el estado financiero del pago y la custodia. Por lo tanto, una orden puede mantenerse en estado logístico `PENDING` aunque su pago haya sido confirmado (`isPaid = true`) y los fondos de la transacción hayan sido liberados al vendedor (`FUNDS_RELEASED`).

> [!TIP]
> **Decisión de diseño académico**: El flujo transaccional se ha dividido en endpoints independientes y llamadas de API separadas (pago, asignación de llaves, creación de custodia) para permitir la medición, testing y defensa de cada transición de estado de manera granular y aislada. En un entorno de producción real, algunas de estas transiciones podrían automatizarse y encadenarse de manera reactiva tras la confirmación de pago.

---

## 3. Registro de Commits Asociados

### Backend (4fun-store-api)

- `9374c9e`: `test(m2): validar cookie httponly en historial comprador`
- `367bc5d`: `Add validation script test-admin-approval-flow.js for Step 9`
- Commits previos en la rama `tesis/flujo-principal` consolidando los endpoints de desacoplamiento para cobro manual, asignación de llaves y transacciones escrow.

### Frontend (4fun-store-web)

- `f10a757`: `fix(m2): normalizar claves digitales en historial comprador`
- `cfea69e`: `Normalize digitalKeys mapping in EntityFactory to support both backend and frontend property names`
- `12b8a9f`: `docs: add sanitized walkthrough statement to web docs`
- `eb5fabe`: `docs: generate academic documentation and env example for thesis`
- `695b3b4`: `refactor: remove localStorage auth dependency and enforce credentials transmission`

---

## 4. Evidencias de Ejecución por Paso

### Paso 1 — Seed mínimo de datos

- **Fecha**: 2026-06-08
- **Datos usados**: Base de datos Supabase, script `prisma/seed.ts`.
- **Resultado esperado**: Datos de catálogo y usuarios inicializados sin órdenes o transacciones residuales.
- **Resultado obtenido**: Exitoso. Base limpia e IDs de catálogo fijados.
- **Configuración clave**:
  - `DISPUTE_WINDOW_DAYS=0` configurado en el archivo `.env` del backend.

---

### Paso 2 — Registro/Login

- **Fecha**: 2026-06-08
- **Evidencia técnica backend**: Script `test-register-flow.js` validó el alta de usuario, la verificación de email y el login posterior con sesión autenticada.
- **Evidencia técnica frontend**: La sesión quedó disponible en el frontend a través del proxy/rewrites de Next.js y `credentials: 'include'`, permitiendo navegación autenticada sin exponer el token al cliente.

---

### Paso 3 — Catálogo Digital

- **Fecha**: 2026-06-09
- **Evidencia técnica backend**: Script `test-catalog-flow.js` comprobó filtros por plataforma, género, rango de precio y respuesta HTTP 404 al solicitar detalles de un producto inactivo.
- **Evidencia visual**: Grabación interactiva de búsqueda y filtros en [docs/evidencias/m2/catalogo/recording.webm](docs/evidencias/m2/catalogo/recording.webm).

---

### Paso 4 — Carrito y Stock Digital

- **Fecha**: 2026-06-09
- **Evidencia técnica backend**: Script `test-cart-flow.js` validó la persistencia y la restricción contra la cantidad máxima basada en las llaves `AVAILABLE` de base de datos.
- **Evidencia visual**: Registro de toast de stock insuficiente y rebote de cantidades en [docs/evidencias/m2/carrito/recording_cart.webm](docs/evidencias/m2/carrito/recording_cart.webm).

---

### Paso 5 — Generación de Orden

- **Fecha**: 2026-06-09
- **Evidencia técnica backend**: Script `test-order-flow.js` validó la creación de la orden `727f...` con items persistidos y el vaciado del carrito.
- **Archivo JSON de salida**: [docs/evidencias/m2/json/m2-last-order.json](docs/evidencias/m2/json/m2-last-order.json).
- **Evidencia visual**: Formulario de envío y redirección a checkout/success en [docs/evidencias/m2/checkout/recording_checkout.webm](docs/evidencias/m2/checkout/recording_checkout.webm).

---

### Paso 6 — Pago Simulado/Admin

- **Fecha**: 2026-06-10
- **Evidencia técnica backend**: Script `test-payment-flow.js` validó el cambio a `isPaid = true` en base de datos sin asignar claves ni generar transacciones de custodia.
- **Archivo JSON de salida**: [docs/evidencias/m2/json/m2-paid-order.json](docs/evidencias/m2/json/m2-paid-order.json).
- **Evidencia visual**: Dashboard administrativo y cambio a badge "LIQUIDADO" en [docs/evidencias/m2/pago/recording_payment.webm](docs/evidencias/m2/pago/recording_payment.webm).

---

### Paso 7 — Asignación de Key Digital

- **Fecha**: 2026-06-10
- **Evidencia técnica backend**: Script `test-key-assignment-flow.js` validó el cambio de estado de las llaves correspondientes a `SOLD` y su vinculación con la orden.
- **Archivo JSON de salida**: [docs/evidencias/m2/json/m2-assigned-keys.json](docs/evidencias/m2/json/m2-assigned-keys.json).

---

### Paso 8 — Transacción en Custodia (Escrow)

- **Fecha**: 2026-06-10
- **Evidencia técnica backend**: Script `test-escrow-flow.js` validó que se generara una única transacción en la tabla `Transaction` en estado `PENDING_APPROVAL` vinculada al vendedor de los productos.
- **Archivo JSON de salida**: [docs/evidencias/m2/json/m2-escrow-transaction.json](docs/evidencias/m2/json/m2-escrow-transaction.json).

---

### Paso 9 — Aprobación/Rechazo Administrativo

- **Fecha**: 2026-06-10
- **Evidencia técnica backend**: Script `test-admin-approval-flow.js` validó la aprobación administrativa del escrow a `FUNDS_RELEASED`, el bloqueo de doble resolución, y el flujo de rechazo con motivo auditado sobre una transacción auxiliar.
- **Archivo JSON de salida**: [docs/evidencias/m2/json/m2-admin-resolution.json](docs/evidencias/m2/json/m2-admin-resolution.json).

---

### Paso 10 — Historial Comprador

- **Fecha**: 2026-06-10
- **Evidencia técnica backend**: Script `test-buyer-history-flow.js` validó el acceso autenticado con cookies `HttpOnly`, el aislamiento de la orden contra accesos de otros compradores (HTTP 403), y la pertenencia correcta de las claves asignadas.
- **Archivo JSON de salida**: [docs/evidencias/m2/json/m2-buyer-history.json](docs/evidencias/m2/json/m2-buyer-history.json).
- **Evidencia visual**: Tablero `/account` con la orden listada, estado pagada, claves ocultas y revelado interactivo en [docs/evidencias/m2/historial/recording_history.webm](docs/evidencias/m2/historial/recording_history.webm).

---

## Declaración de Cierre del Hito M2

El Hito M2 queda cerrado funcionalmente y documentado en actas portables. Se validó el flujo principal de 4Fun Store desde la preparación de datos base hasta la visualización final de la compra por parte del comprador.

El circuito comercial completo (registro, autenticación, catálogo con control de stock digital, carrito, checkout, marcado de pago simulado, asignación de llaves, creación de custodia, aprobación/rechazo administrativo e historial de cuenta del comprador con llaves entregadas) ha sido rigurosamente testeado y certificado, demostrando el correcto comportamiento ante casos positivos y el control de robustez ante flujos negativos o accesos no autorizados.
