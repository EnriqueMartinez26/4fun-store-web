# Preferencias de Trabajo para 4Fun (Proyecto de Tesis)

Este archivo actúa como un ecosistema de reglas arquitectónicas. Todo el código desarrollado, refactorizado o revisado debe apegarse estrictamente a los siguientes puntos.

## 1. Arquitectura: Patrón ViewModel (OOP)
El proyecto utiliza una arquitectura separada sustentada en el patrón **ViewModel** para aislar la lógica de negocio y de estado de la UI (React).
- **Vista (Componente React):** Solo debe encargarse de renderizar UI (JSX) y canalizar eventos del usuario. No debe contener lógica condicional compleja, reglas de enrutamiento pesadas ni cálculos de e-commerce.
- **ViewModel:** Capa intermedia orientada a objetos (instanciada o manejada vía custom hooks) que mantiene el estado, realiza validaciones (ej. stock, permisos) y se comunica con servicios externos (APIs, Firebase, etc).
- **Prohibición estricta:** NO escribir `useEffect` o funciones enormes dentro de los funcionales `page.tsx` para mutar datos complejos. Derivar esa responsabilidad a un ViewModel.

## 2. Pila Tecnológica Central
- **Next.js 15:** Uso de *App Router* (`app/`). Respetar la asincronía en los componentes de servidor (`page.tsx` asíncronos cuando aplique).
- **React 18:** Uso de componentes funcionales y Hooks.
- **TypeScript:** Configuración estricta (`strict: true`). 
  - El uso de `any` está prohibido sin justificación previa explícita.
  - Priorizar el uso de `interface` sobre `type` para modelos de datos (POO).

## 3. Convenciones de QA y Testing
- Todos los componentes deben pasar `eslint` sin *warnings*.
- Las interfaces y funciones clave del negocio (carrito de compras, control de pagos, roles de usuario) deben tener su respectiva clase ViewModel que sea fácilmente testeable con **Vitest**.
- Antes de cada commit, se debe verificar que el código formatee con `prettier` y recompile con `tsc --noEmit`.

## 4. Diseño y UX (Tesis)
- La interfaz debe presentar un aspecto *Premium* y altamente responsivo (TailwindCSS - Radix UI - shadcn/ui).
- Usar variables CSS para modos oscuros y vibrantes ("4Fun"). No utilizar colores primitivos o diseños "estilo MVP", ya que es una tesis universitaria.
