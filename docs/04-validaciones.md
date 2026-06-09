# Capa de Validaciones y Esquemas: 4Fun Store Web

Este documento detalla los mecanismos implementados en el frontend para asegurar la integridad de la información ingresada por el usuario antes de ser remitida al servidor backend.

## Validación de Formularios (Zod y React Hook Form)

Se utiliza **Zod** para definir esquemas de validación estricta y **React Hook Form** para gestionar el estado y ciclo de vida de los formularios de la interfaz. Esto asegura consistencia en las respuestas visuales ante errores de tipeado.

Los esquemas de validación se centralizan en `src/lib/schemas.ts`:

### 1. Esquema de Autenticación (`loginSchema`)

- **Email**: Obligatorio, debe poseer formato válido de correo electrónico.
- **Password**: Requerido, longitud mínima de 6 caracteres.

### 2. Esquema de Registro (`registerSchema`)

- **Name**: Obligatorio, longitud mínima de 2 caracteres.
- **Email**: Formato de correo electrónico válido.
- **Password**: Longitud mínima de 6 caracteres.
- **ConfirmPassword**: Debe coincidir estrictamente con la contraseña provista.

### 3. Esquema de Creación/Edición de Producto (`productSchema`)

- **Name**: Requerido, no vacío.
- **Description**: Mínimo 10 caracteres para asegurar la legibilidad del catálogo.
- **Price**: Debe ser un número decimal estrictamente positivo.
- **Stock**: Entero mayor o igual a 0.
- **Image**: URL válida (comprobación opcional o de Cloudinary).
- **Platform/Genre**: Selección obligatoria de categorías válidas.

---

## Validación Dinámica de Stock (Carrito)

Además de los esquemas estáticos, la aplicación ejecuta lógica de validación transaccional sobre las operaciones en caliente:

- **Pre-carga**: Antes de despachar una acción al carrito (`addToCart` o `updateQuantity`), se evalúa la cantidad total pretendida contra el stock físico informado en el objeto de datos del videojuego digital.
- **Bloqueo**: Si la cantidad solicitada excede la disponibilidad actual, la interfaz detiene la ejecución, emite una notificación visual al usuario (Toast de alerta) y no ejecuta la llamada HTTP ni actualiza el estado local.
