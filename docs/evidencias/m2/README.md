# Índice Maestro de Evidencias (Hito M2)

Este documento centraliza y organiza todas las evidencias de validación técnica y funcional recopiladas durante la ejecución del **Hito M2 (Cierre del Flujo Principal)**. Sirve como anexo de auditoría para la defensa de la tesis.

---

## Matriz Navegable de Evidencias

| Paso        | Caso de Uso / Flujo    | Evidencia (Archivo/Video)                                                                                                                                                                                                                                                               | Tipo de Recurso | Qué Demuestra                                                                                                                 |
| :---------- | :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------: | :---------------------------------------------------------------------------------------------------------------------------- |
| **Paso 1**  | Seed de base de datos  | [prisma/seed.ts](../../../4fun-store-api/prisma/seed.ts)                                                                                                                                                                                        |     Script      | Inicialización reproducible del catálogo de videojuegos y fijación de IDs constantes de prueba.                               |
| **Paso 2**  | Registro y Login      | [test-register-flow.js](../../../4fun-store-api/scripts/test-register-flow.js)                                                                                                                                                                  |   Test Script   | Alta de usuario, verificación de email y login posterior con sesión autenticada.                                                |
| **Paso 3**  | Catálogo Digital       | [recording.webm](catalogo/recording.webm)                                                                                                                                                            |      Video      | Interfaz de catálogo interactiva, aplicación de filtros de plataforma/género/precio y SSR.                                    |
| **Paso 4**  | Carrito y Stock        | [recording_cart.webm](carrito/recording_cart.webm)                                                                                                                                                   |      Video      | Persistencia del carrito en cliente y control en caliente/servidor del stock para evitar sobreventa.                          |
| **Paso 5**  | Creación de Orden      | [recording_checkout.webm](checkout/recording_checkout.webm)<br>[m2-last-order.json](json/m2-last-order.json)      |  Video + JSON   | Generación de una orden persistida en base de datos con estado logístico inicial `PENDING` y vaciado de carrito.              |
| **Paso 6**  | Pago Simulado / Admin  | [recording_payment.webm](pago/recording_payment.webm)<br>[m2-paid-order.json](json/m2-paid-order.json)            |  Video + JSON   | Transición del estado de pago de la orden a `isPaid = true` sin alterar logística ni liberar llaves aún.                      |
| **Paso 7**  | Asignación de Keys     | [m2-assigned-keys.json](json/m2-assigned-keys.json)                                                                                                                                                  |      JSON       | Vinculación atómica de llaves digitales correspondientes a la orden y cambio de estado a `SOLD` (evitando sobreventa).        |
| **Paso 8**  | Custodia Escrow        | [m2-escrow-transaction.json](json/m2-escrow-transaction.json)                                                                                                                                        |      JSON       | Creación de transacción financiera de escrow asociada al vendedor en estado `PENDING_APPROVAL`.                               |
| **Paso 9**  | Aprobación / Rechazo   | [m2-admin-resolution.json](json/m2-admin-resolution.json)                                                                                                                                            |      JSON       | Resolución del escrow por el administrador liberando fondos (`FUNDS_RELEASED`) u operando rechazo auditado.                   |
| **Paso 10** | Historial y Keys       | [recording_history.webm](historial/recording_history.webm)<br>[m2-buyer-history.json](json/m2-buyer-history.json) |  Video + JSON   | Visualización de la orden pagada en la cuenta del comprador e interactividad para desvelar llaves digitales de manera segura. |

---

## Cómo Ejecutar y Verificar Localmente

Para reproducir las evidencias de esta matriz, se puede ejecutar la suite de scripts de test del backend de forma secuencial:

```powershell
# En la terminal (4fun-store-api)
node scripts/test-register-flow.js
node scripts/test-catalog-flow.js
node scripts/test-cart-flow.js
node scripts/test-order-flow.js
node scripts/test-payment-flow.js
node scripts/test-key-assignment-flow.js
node scripts/test-escrow-flow.js
node scripts/test-admin-approval-flow.js
node scripts/test-buyer-history-flow.js
```
