# Plan de Pruebas Unitarias e Integración: 4Fun Store Web

Este documento presenta la estrategia de pruebas de calidad implementada sobre la aplicación web frontend para asegurar su correcto comportamiento lógico.

## Entorno de Pruebas

La infraestructura para la ejecución de pruebas está compuesta por:

- **Vitest**: Como motor de ejecución rápido y compatible con TypeScript.
- **Testing Library (React)**: Para la renderización de componentes y simulación de interacciones de usuario en un DOM virtual.

## Casos de Pruebas Críticos

### 1. Autenticación e Identidad

- **Validación de Login**: Verifica que el formulario emita mensajes de error cuando los campos están vacíos o no cumplen con los formatos esperados.
- **Integridad de Contraseña**: Comprueba la correcta validación del campo de confirmación durante la creación de cuentas de usuario.

### 2. Lógica del Carrito (`CartContext`)

- **Añadir Ítems**: Prueba la correcta incorporación de videojuegos digitales a la cesta de compra local e internacional.
- **Control de Stock**: Simula la adición de productos con cantidad superior al stock límite disponible, comprobando el bloqueo preventivo y el mensaje de aviso al usuario.
- **Rollback de Conexión**: Verifica que si la API del backend reporta un error durante la actualización de cantidad, el frontend revierta el carrito al estado previo de manera inmediata (estrategia transaccional).

### 3. Capa de Servicios y API

- **HttpTransport**: Pruebas sobre la inyección correcta de cabeceras, manejo de códigos de error HTTP (por ejemplo, respuestas 401 y 500) y formateo de queries.

---

## Ejecución de Pruebas

Para correr el set de pruebas completo del frontend, ejecute el siguiente comando:

```bash
npm run test
```

Esto ejecutará Vitest en modo interactivo/watch en la terminal para validar todos los archivos de test `.test.ts` o `.test.tsx` definidos en el proyecto.
