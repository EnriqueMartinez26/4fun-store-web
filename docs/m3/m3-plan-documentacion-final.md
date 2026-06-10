# Plan de Documentación Técnica y Académica Final (Hito M3)

Este documento constituye el plan maestro del **Hito M3** para la consolidación de la documentación técnica y académica de la tesis sobre la plataforma **4Fun Store**.

---

## 1. Índice del Plan de Documentación Académica

El Hito M3 tiene como objetivo transformar las validaciones funcionales y la base de código del proyecto en un cuerpo teórico-práctico apto para la defensa académica. El contenido se divide en las siguientes secciones:

- [1. Narrativa de Defensa y Justificaciones de Diseño](#2-narrativa-de-defensa-y-justificaciones-de-diseño)
- [2. Estructura de la Arquitectura y Patrones Aplicados](#3-estructura-de-la-arquitectura-y-patrones-aplicados)
- [3. Matriz de Riesgos y Limitaciones Académicas](#4-matriz-de-riesgos-y-limitaciones-académicas)
- [4. Guion de la Demo Guiada para la Defensa (7-10 Minutos)](#5-guion-de-la-demo-guiada-para-la-defensa-7-10-minutos)
- [5. Checklist y Cronograma de Entrega](#6-checklist-y-cronograma-de-entrega)

---

## 2. Narrativa de Defensa y Justificaciones de Diseño

En esta sección se abordan las decisiones de ingeniería fundamentales del proyecto y se preparan los argumentos clave ante las preguntas recurrentes del jurado de tesis:

### ¿Por qué el sistema es "digital-only"?

- **Enfoque de investigación**: El objetivo de la tesis es modelar la complejidad transaccional, el control estricto de inventario digital y la mitigación de fraudes en transferencias de valor intangibles. Los productos físicos introducen variables logísticas tradicionales (envíos, aduanas, peso) que no forman parte del núcleo de investigación.
- **Complejidad intangible**: Los bienes digitales requieren entrega inmediata, validación en caliente y mitigación del "fraude por contra-cargo" (el usuario consume el bien digital e indica que no lo recibió).

### ¿Por qué el stock real son las `DigitalKeys`?

- **Consistencia e inventario físico-digital**: En un e-commerce tradicional de claves digitales, vender una clave sin stock disponible destruye la reputación del comercio. Asociar la disponibilidad del producto directamente a la existencia de registros con estado `AVAILABLE` en la tabla `DigitalKey` asegura transacciones consistentes y previene la sobreventa a nivel de base de datos.
- **Trazabilidad total**: Cada unidad en venta es un objeto único con su propio valor y estado. El stock no es un mero "contador entero" en la tabla de productos, sino la suma real de registros de claves únicas disponibles.

### ¿Por qué el pago es simulado/administrativo?

- **Alcance académico y desacoplamiento**: El objetivo principal de la investigación es modelar la transición de estados internos del ciclo de vida de una orden de compra y el comportamiento de la custodia del dinero (escrow), no integrar SDKs comerciales de terceros que cambian constantemente o requieren credenciales productivas reales.
- **Control de auditoría**: Un pago simulado administrado nos permite probar flujos de prueba positivos, negativos y flujos excepcionales de forma controlada sin costos reales de transacciones bancarias.

### ¿Por qué se separaron pago, keys y escrow?

- **Responsabilidad Única (SRP)**:
  - El **pago** certifica que los fondos del comprador han salido de su cuenta y están en poder de la plataforma (Simulación de pasarela).
  - La **asignación de keys** es un proceso lógico de asignación de inventario (entregar el producto al comprador).
  - El **escrow** (transacción de custodia) protege al comprador reteniendo el dinero temporalmente y garantizando que el vendedor no reciba los fondos hasta que se confirme la validez del bien digital o expire el tiempo de disputa.
- **Robustez transaccional**: Permite aislar fallos. Si la pasarela de pago responde pero el servidor de claves se cae, la orden queda marcada como pagada, pero el flujo de asignación puede reintentarse sin duplicar el cobro.

### ¿Por qué `Order.status` y `Transaction.status` son distintos?

- `Order.status` representa el **ciclo operativo y logístico** de la orden (ej: `PENDING`, `COMPLETED`).
- `Transaction.status` representa el **estado financiero y de custodia del dinero** (ej: `PENDING_APPROVAL`, `FUNDS_RELEASED`, `REJECTED`).
- _Caso Académico_: Una orden puede estar completada operativamente desde la perspectiva del comprador (que ya recibió sus claves), pero su transacción de custodia financiera puede seguir retenida (`PENDING_APPROVAL`) a la espera de que expire el plazo de disputa del comprador para finalmente liberar el dinero al vendedor (`FUNDS_RELEASED`).

### ¿Por qué se usan cookies `HttpOnly`?

- **Seguridad contra XSS (Cross-Site Scripting)**: Almacenar tokens JWT en `localStorage` o cookies estándar expone la sesión al robo de credenciales mediante scripts maliciosos inyectados en la aplicación. Las cookies `HttpOnly` no son accesibles a través de la API `document.cookie` de JavaScript en el navegador, mitigando este vector de ataque.
- **Integración con SSR**: Las cookies viajan automáticamente en cada solicitud HTTP al servidor de Next.js, lo que facilita el renderizado del lado del servidor (SSR) basado en el estado de autenticación del usuario.

### ¿Por qué se validan casos negativos?

- Una tesis robusta no solo demuestra que el sistema funciona bajo condiciones ideales ("happy path"), sino que demuestra resiliencia ante anomalías. Validar que un usuario no autenticado reciba un `401 Unauthorized`, que un comprador no pueda acceder a las claves de otro comprador (`403 Forbidden`) y que no se puedan reclamar fondos de una custodia ya resuelta asegura la solidez del modelo de negocio diseñado.

---

## 3. Estructura de la Arquitectura y Patrones Aplicados

### Arquitectura Técnica

```mermaid
graph TD
    subgraph Frontend (Next.js - App Router)
        UI[Componentes de UI / Client-side]
        SSR[Catálogo / SSR pages]
        WebAPI[Servicios de API / Axios]
        Proxy[Rewrites Proxy Local]
    end

    subgraph Backend (Express.js)
        Server[Servidor Express]
        AuthMid[Middleware Auth & RBAC]
        Controllers[Controladores MVC]
        Services[Capa de Servicios de Negocio]
    end

    subgraph Persistencia
        Prisma[ORM Prisma]
        DB[(Base de Datos PostgreSQL)]
    end

    UI --> Proxy
    SSR --> Proxy
    Proxy --> Server
    Server --> AuthMid
    AuthMid --> Controllers
    Controllers --> Services
    Services --> Prisma
    Prisma --> DB
```

- **Frontend (Next.js)**:
  - **SSR en catálogo**: Renderizado del lado del servidor de la lista de productos para optimizar SEO y velocidad.
  - **React Client Components**: Gestión dinámica de estado en el carrito y vistas interactivas del historial del comprador.
  - **Proxy de Rewrites local**: Configurado para evitar problemas de CORS y asegurar el envío de cookies de sesión `HttpOnly` al subdominio de API.
- **Backend (Express.js)**:
  - **MVC simplificado**: Controladores encargados del procesamiento de payloads HTTP.
  - **Capa de Servicios (Service Layer)**: Encapsulación estricta de las reglas de negocio (procesamiento de órdenes, custodia de fondos, validaciones de stock).
  - **RBAC (Role-Based Access Control)**: Middleware para diferenciar y proteger rutas exclusivas de Comprador, Vendedor y Administrador.
  - **Transacciones Atómicas con Prisma**: Garantía de consistencia ACID en la asignación de claves y generación de registros de transacciones.

### Patrones de Diseño Aplicados

1.  **MVC (Model-View-Controller)**: Separación clara de la interfaz de usuario en el frontend y el enrutamiento/controladores en el backend.
2.  **Service Layer**: Desacoplamiento de la lógica de negocio de los controladores HTTP.
3.  **DTO (Data Transfer Object) / Mapper**: Mapeo y formateo de entidades de base de datos antes de ser enviadas a la interfaz, protegiendo información sensible como contraseñas hash u ocultando las claves digitales hasta que el comprador las revele.
4.  **RBAC (Role-Based Access Control)**: Control granular de accesos basado en roles asignados en el modelo de usuario.
5.  **Strategy (en catálogos)**: Filtros dinámicos basados en parámetros de consulta de URL de manera extensible.

---

## 4. Matriz de Riesgos y Limitaciones Académicas

La inclusión de una matriz de riesgos y limitaciones en la tesis demuestra madurez académica e investigadora al delimitar el alcance real del software desarrollado:

| Limitación Identificada                                | Justificación Académica / Mitigación                                                                                                                                                                                                                                                                                                        |
| :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **No procesa dinero real**                             | **Justificación**: El objetivo de la tesis se centra en modelar los cambios de estado transaccionales y el ciclo de vida del depósito en custodia (escrow). El cobro se realiza simulado por un rol administrativo para conservar el entorno de pruebas seguro y gratuito.                                                                  |
| **Despliegue local validado**                          | **Justificación**: Para fines de evaluación técnica, la plataforma está configurada y optimizada para ejecutarse localmente con bases de datos reproducibles y seeds controlados, asegurando que el jurado pueda auditar el flujo de punta a punta sin dependencias de infraestructura en la nube.                                          |
| **Sin integración comercial de Mercado Pago / PayPal** | **Justificación**: Las pasarelas comerciales cambian sus APIs con frecuencia y añaden complejidad de red innecesaria para el núcleo del estudio de investigación de la tesis. Se mitiga mediante un endpoint simulado de pasarela que imita la respuesta asíncrona (Webhooks) de pago exitoso.                                              |
| **Acciones de administración por API / Script**        | **Justificación**: Ciertas transiciones (marcado de pago, resolución de escrow por el administrador) se prueban y auditan mediante scripts del lado del servidor para garantizar la reproducibilidad técnica rigurosa de los flujos del backend sin requerir una sobrecarga de desarrollo en pantallas de UI de administración secundarias. |

---

## 5. Guion de la Demo Guiada para la Defensa (7-10 Minutos)

Un guion estructurado evita improvisaciones durante la demostración al jurado:

1.  **Minuto 0:00 - 1:30 | Introducción y Preparación**:
    - Mostrar la consola de base de datos PostgreSQL vacía u ordenada ejecutando el seed.
    - Explicar la arquitectura de dos repositorios y el uso del proxy local de Next.js.
2.  **Minuto 1:30 - 3:00 | Catálogo y Reserva de Stock**:
    - Iniciar sesión como Comprador.
    - Filtrar juegos en el catálogo.
    - Intentar añadir unidades de un juego superando las llaves disponibles en la base de datos para mostrar el toast de bloqueo (caso de uso negativo).
3.  **Minuto 3:00 - 4:30 | Creación de Orden y Pago Simulado**:
    - Proceder al checkout de los juegos válidos en el carrito.
    - Mostrar la creación exitosa de la orden en estado `PENDING`.
    - Simular el pago (a través del flujo administrativo del backend) y demostrar cómo la orden pasa a `isPaid = true`.
4.  **Minuto 4:30 - 6:30 | Asignación de Inventario y Escrow**:
    - Mostrar cómo se asignan de forma automática las `DigitalKeys` (cambiando su estado a `SOLD` y asociándose a la orden).
    - Mostrar la creación automática de la transacción de custodia en estado `PENDING_APPROVAL` protegiendo los fondos.
5.  **Minuto 6:30 - 8:00 | Resolución de Custodia e Historial**:
    - Ejecutar la resolución del escrow por parte del Administrador (liberando los fondos al vendedor).
    - Regresar a la sesión del Comprador, navegar a la pestaña `/account` e ingresar al historial.
    - Revelar de forma interactiva una de las llaves digitales compradas y constatar que el flujo transaccional se cerró perfectamente.
6.  **Minuto 8:00 - 10:00 | Preguntas y Respuestas**:
    - Espacio libre para abordar consultas de arquitectura y base de datos con el jurado.

---

## 6. Checklist y Cronograma de Entrega

- [x] **Fase 1**: Congelar el Hito M2 (Commit y etiquetas creadas en repositorios API y Web).
- [x] **Fase 2**: Crear el Índice Maestro de Evidencias en [README.md](file:///d:/Programación/Proyectos/Facultad/tesis/4fun-store-web/docs/evidencias/m2/README.md).
- [ ] **Fase 3**: Redacción formal del capítulo "Narrativa de Defensa" en el borrador de la tesis.
- [ ] **Fase 4**: Redacción formal del capítulo "Arquitectura y Patrones" en la memoria de tesis.
- [ ] **Fase 5**: Grabación de un simulacro de demo en vídeo de 8 minutos para previsualizar el ritmo de la presentación.
- [ ] **Fase 6**: Revisión final con el director/tutor de tesis y cierre formal de M3.
