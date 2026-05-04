# Skill: Auditoría de ViewModel

## Objetivo
Verificar que un archivo o módulo React UI (`.tsx`) respeta la arquitectura de "Separación de Intereses" (Separation of Concerns) usando un ViewModel para su lógica.

## INSTRUCCIONES PARA EL AGENTE DE IA
Cuando el usuario invoque esta "skill" para auditar un componente React, debes realizar los siguientes pasos de forma secuencial y estructurada:

1. **Lectura del archivo:** Solicita o infiere el componente a auditar y ábrelo.
2. **Análisis de Importaciones:** Verifica si el componente importa y se suscribe a algún "ViewModel" o "Store orientado a objetos" (e.g. `useCartViewModel()`).
3. **Búsqueda de Infracciones:** Escanea el cuerpo del componente en búsqueda de:
    - Uso de `useState` o `useReducer` para lógica estructurada compleja que exceda estado visual genérico (e.g., `isOpen`).
    - Peticiones asíncronas (`fetch`, llamadas directas a un ORM o base de datos) dentro del cuerpo del componente o dentro de `useEffect`.
    - Cálculos matemáticos pesados.
4. **Generación de Reporte:** Responde con un resumen detallado usando esta estructura Markdown:
   - **Componente Analizado:** [Nombre]
   - **Calificación:** [Pasa | Falla]
   - **Infracciones Detectadas (Si aplica):** Explicación de líneas.
   - **Refactorización Propuesta:** Breve pseudo-código mostrando cómo extraer la lógica infractora hacia el ViewModel.
