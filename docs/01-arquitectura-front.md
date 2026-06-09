# Arquitectura del Frontend: 4Fun Store Web

Este documento describe el diseño arquitectónico de la aplicación cliente **4Fun Store Web**, detallando los patrones y la organización de carpetas para el correcto desacoplamiento de responsabilidades.

## Estructura de Capas (Organización del Repositorio)

La aplicación sigue el enfoque de desarrollo estructurado en capas dentro del directorio `src/`:

```
src/
├── app/          # Capa de Rutas y Páginas (Next.js App Router)
├── components/   # Capa de UI y Presentación (Componentes visuales y de diseño)
├── context/      # Capa de Estado Global (Manejo de estados transversales: Auth, Cart)
├── domain/       # Capa de Dominio (Entidades de negocio y fábricas)
├── hooks/        # Capa de Lógica Reutilizable (Hooks de cliente / ViewModels)
├── lib/          # Capa de Infraestructura (Servicios de red, HTTP transport, utilitarios)
└── styles/       # Estilos globales (Tailwind CSS)
```

### 1. Capa de Rutas y Páginas (`src/app/`)

Utiliza **Next.js App Router** para definir el enrutamiento físico del proyecto. Las páginas actúan como orquestadores de alto nivel que integran los componentes visuales con los estados globales y servicios necesarios.

### 2. Capa de Componentes (`src/components/`)

Contiene los elementos visuales de la interfaz de usuario, organizados en subcarpetas temáticas (por ejemplo, `ui` para componentes base de Radix, `layout` para cabeceras y pie de página, y componentes especializados de catálogo y administración).

### 3. Capa de Estado Global (`src/context/`)

Administra estados complejos que deben persistir a lo largo de múltiples páginas de la aplicación:

- `AuthContext`: Provee los datos de sesión y métodos de control de acceso basados en roles.
- `CartContext`: Coordina la persistencia, mutación y validación del stock de compras del usuario.

### 4. Capa de Dominio (`src/domain/`)

Contiene lógica de negocio puramente agnóstica de frameworks o librerías de UI:

- **Entidades**: Modelos autovalidados con comportamiento encapsulado (por ejemplo, `UserEntity` que define si un usuario tiene rol administrativo o comercial).
- **Fábricas (`EntityFactory`)**: Responsables de mapear los payloads sin tipar del backend a instancias de objetos de dominio sólidas.

### 5. Capa de Hooks (`src/hooks/`)

Implementa la lógica del cliente y la abstracción del estado visual (patrón similar a ViewModels). Permite desacoplar las vistas de React de las llamadas directas a servicios y el estado global, facilitando las pruebas unitarias.

### 6. Capa de Infraestructura (`src/lib/`)

- `HttpTransport`: Único punto de contacto con el protocolo HTTP de la red. Encapsula configuraciones globales como la URL base del backend y la directiva `credentials: 'include'` para cookies HttpOnly.
- `Services`: Clases estáticas especializadas (`AuthApiService`, `CartApiService`, `ProductApiService`) que realizan las requests y formulan las peticiones necesarias al backend.
