# Skill: QA Reglas de E-commerce

## Objetivo
Analizar la lógica de compras, carritos, stocks y pagos asegurando robustez ante edge cases.

## INSTRUCCIONES PARA EL AGENTE DE IA
Cuando el usuario invoque el chequeo "QA E-commerce" sobre un archivo o directorio que maneje la compra, verifica que el código cumpla con lo siguiente:

1. **Test del Stock Negativo/Bajo Cero:** Asegura que exista lógica para evitar que el número de productos seleccionados por el usuario exceda el stock de la base de datos (y que no se permita agregar cantidades en negativo).
2. **Cálculo de Precios Derivados:** En los "Checkout ViewModels", el precio final a cobrar debe ser calculado de cero (iterando el carrito) combinándolo de un origen seguro. Nunca se debe "confiar" en un subtotal arrastrado como estado persistente desde la vista si este puede ser falsificado.
3. **Consistencia:** Si se aplican descuentos, ¿Se previene que el descuento reduzca el subtotal por debajo de 0?
4. **Recomendaciones de Arquitectura (Resolución de Infracciones):**
   Si durante la evaluación detectas que falta alguno de estos controles, debes redactar la recomendación basándote estrictamente en los siguientes pilares:
   - **Para el Control de Stock:** El ViewModel (ej. `CartViewModel.ts` o custom hook `useCartViewModel`) debe interceptar el evento `onAddToCart` y consultar el stock real. Sin embargo, recalca que la validación definitiva **debe ocurrir en el Backend** (`services/productService.js` o `cartService.js`), retornando un HTTP 400 si falla. El ViewModel frontend solo debe atrapar la excepción y disparar un "Toast" visual.
   - **Para el Cálculo de Precios Seguros:** El `CheckoutViewModel` debe enviar al backend únicamente un array de IDs y cantidades (ej. `[{ id: 1, cant: 2 }]`). El Backend (`orderService.js`) es el único que debe consultar la DB (origen seguro) y calcular el total. **Prohibición estricta:** El frontend jamás debe enviar un campo `total_a_pagar` en el body del POST. Esto es un punto crítico de seguridad para la defensa de la tesis.
