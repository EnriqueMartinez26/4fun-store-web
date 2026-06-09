# Limitaciones Académicas del Proyecto: 4Fun Store Web

Este documento detalla las simplificaciones y limitaciones técnicas asumidas en el frontend de **4Fun Store Web** para cumplir con el alcance estipulado de un proyecto de tesis de Tecnicatura.

## Limitaciones Técnicas y Funcionales

### 1. Simulación del Flujo de Pago

El flujo de compra culmina con la creación de la orden en el servidor y una confirmación visual. Aunque el sistema está estructurado conceptualmente para soportar una pasarela como MercadoPago, el pago efectivo está simulado en el frontend. No se gestionan transacciones con tarjetas reales ni tokens bancarios en producción para evitar riesgos de seguridad y costos operativos.

### 2. Panel Administrativo Acotado

Las vistas del panel de administración (`/admin/*`) están limitadas a las funciones críticas necesarias para verificar el flujo de negocio:

- Creación y edición básica de videojuegos (título, descripción, precio, stock, imágenes).
- Auditoría simple del historial de órdenes generadas por los usuarios.
  No se incluyen reportes contables complejos, analíticas en tiempo real ni exportación de datos a formatos como Excel o PDF.

### 3. Ausencia de Pasarela Multimoneda

Todos los precios se informan y computan en la moneda configurada por el backend de manera estática. No hay conversión de divisas en caliente basada en geolocalización o APIs externas financieras.

### 4. Dependencia Absoluta de la API Backend

La aplicación frontend está diseñada bajo una arquitectura desacoplada y consume datos dinámicos mediante HTTP. Por lo tanto, no cuenta con un sistema de almacenamiento local autónomo que le permita operar sin conexión a la API backend (`4fun-store-api`), salvo para la navegación superficial de páginas estáticas e hidratación básica del carrito local.
