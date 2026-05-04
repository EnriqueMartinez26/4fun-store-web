# 🎯 SKILL: Refactorización de Lógica de Negocio - Vendedores, Admins y Retenciones

## Propósito
Refactorizar la lógica de roles (Vendedor vs. Admin) y el flujo financiero de ventas, asegurando que:
- **Permisos:** Vendedores acceden solo a sus productos; Admins tienen acceso global
- **Retención de Fondos:** El dinero queda en estado PENDING_APPROVAL hasta que Admin lo libera
- **Arquitectura:** Toda lógica en ViewModels/Servicios, cero lógica en React
- **Tipado:** TypeScript estricto, sin `any`

---

## 📋 Checklist de Auditoría Inicial

Antes de implementar cambios, ejecuta esta auditoría:

- [ ] **Permisos de productos**: Revisa dónde se filtra/valida acceso a productos (`productController`, `productService`)
- [ ] **Roles actuales**: Confirma que existen `ADMIN` y `SELLER` en la DB y servicios
- [ ] **Flujo de órdenes**: Traza cómo se actualiza el balance del vendedor al completar una venta
- [ ] **ViewModels existentes**: Identifica dónde viven los ViewModels del seller y transacciones (`src/hooks` o `src/context`)
- [ ] **Interfaces de estado**: Busca enums/tipos de estado de orden/transacción actuales

---

## 🔧 FASE 1: Auditoría y Refactorización de Permisos

### Paso 1.1: Mapear la Lógica Actual de Acceso
**Busca en:**
- `Proyecto-Back/controllers/productController.js` - endpoints de producto
- `Proyecto-Back/services/productService.js` - filtrado por seller
- `Proyecto-Back/middlewares/auth.js` - contexto de usuario autenticado

**Validar:**
```
Si request.user.role === "SELLER" → Permitir edición solo si request.user.id === product.sellerId
Si request.user.role === "ADMIN" → Permitir edición de cualquier producto
```

### Paso 1.2: Implementar el Middleware de Verificación
**Crear/Actualizar:**
- `Proyecto-Back/middlewares/verifyProductOwnership.js` (nuevo o extender `auth.js`)

**Interfaz esperada:**
```javascript
// Valida que el usuario sea dueño del producto o sea admin
async function verifyProductOwnership(req, res, next) {
  const product = await getProductById(req.params.productId);
  
  if (req.user.role === "ADMIN" || req.user.id === product.sellerId) {
    next();
  } else {
    throw new ForbiddenError("No tienes permiso para editar este producto");
  }
}
```

### Paso 1.3: Refactorizar Endpoints de Producto
**En `productRoutes.js`:**
- Agregar `verifyProductOwnership` a: PUT, PATCH, DELETE de producto individual
- GET individual y listado: Sin restricción (todos pueden ver)
- GET `/mis-productos` (nuevo endpoint): Solo retorna productos del seller autenticado

---

## 💰 FASE 2: Flujo de Retención de Fondos (Sistema de Escrow)

### Paso 2.1: Extender Schema de Transacciones
**En `Proyecto-Back/prisma/schema.prisma`:**

```prisma
enum TransactionStatus {
  PENDING_APPROVAL    // Vendedor vendió, dinero en escrow
  FUNDS_RELEASED      // Admin aprobó, dinero transferido
  CANCELLED
  REFUNDED
}

model Transaction {
  id                String    @id @default(cuid())
  orderId           String    @unique
  order             Order     @relation(fields: [orderId], references: [id])
  
  sellerId          String
  seller            User      @relation("SellerTransactions", fields: [sellerId], references: [id])
  
  amount            Float
  status            TransactionStatus @default(PENDING_APPROVAL)
  
  approvedBy        String?   // Admin que aprobó
  approvedAt        DateTime?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

### Paso 2.2: Crear TransactionViewModel
**Archivo: `prueba-front/src/context/viewmodels/TransactionViewModel.ts`**

**Responsabilidades:**
- Gestionar estados de transacción
- Exponer métodos para Admin: `approveFundsTransfer(transactionId)`
- Exponer datos para Seller: `getPendingTransactions()`, `getTotalEscrowBalance()`

**Interfaz:**
```typescript
interface ITransactionViewModel {
  // Estado
  pendingTransactions: Transaction[];
  escrowBalance: number;
  
  // Métodos
  approveFundsTransfer(transactionId: string): Promise<void>;
  rejectFundsTransfer(transactionId: string, reason: string): Promise<void>;
  getPendingTransactionsForSeller(sellerId: string): Promise<Transaction[]>;
}
```

### Paso 2.3: Actualizar Servicio de Órdenes
**En `Proyecto-Back/services/orderService.js`:**

**Cuando la orden se completa exitosamente:**
```javascript
async completeOrder(orderId) {
  // 1. Marcar orden como completada
  // 2. NO transferir dinero directamente
  // 3. Crear Transaction con status = PENDING_APPROVAL
  // 4. Restar del balance total del seller (usa balance "congelado")
  
  const transaction = await Transaction.create({
    orderId,
    sellerId: order.sellerId,
    amount: order.totalAmount,
    status: "PENDING_APPROVAL"
  });
  
  return transaction;
}
```

### Paso 2.4: Crear Endpoint Admin para Aprobar Transferencias
**En `Proyecto-Back/routes/dashboardRoutes.js` (o nueva `/transactionRoutes.js`):**

```javascript
router.post(
  '/transactions/:transactionId/approve',
  requireRole('ADMIN'),
  async (req, res) => {
    // Valida que transactionId existe y está PENDING_APPROVAL
    // Transfiere funds a seller.balance
    // Actualiza transaction.status = FUNDS_RELEASED
    // Registra en approvedBy, approvedAt
  }
);
```

---

## 🏗️ FASE 3: Cumplimiento de Arquitectura

### Paso 3.1: Validación de Cero Lógica en React

**Revisa estos archivos y asegúrate que NO hay:**
```
❌ if (role === 'SELLER') -> modificar estado
❌ balance = balance - amount
❌ Validaciones de propiedad del producto
❌ Llamadas a DB directas desde componentes
```

**Debe estar en ViewModels/Servicios:**
```
✅ Lógica de permisos → Middlewares + Services
✅ Cálculos de balance → ViewModel + Service
✅ Validaciones → Service layer
```

### Paso 3.2: Interfaces TypeScript Semánticas

**Crear archivo: `Proyecto-Back/types/transaction.ts`**

```typescript
export enum TransactionStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  FUNDS_RELEASED = 'FUNDS_RELEASED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface Transaction {
  id: string;
  orderId: string;
  sellerId: string;
  amount: number;
  status: TransactionStatus;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// NO usar `any`
// Validar con: if (!transaction || typeof transaction.amount !== 'number')
```

### Paso 3.3: Validación de Tipos en Services

**En `orderService.js`, `transactionService.js`:**
```javascript
// Antes de cualquier operación:
if (typeof amount !== 'number' || amount <= 0) {
  throw new ValidationError('Amount must be a positive number');
}

if (!transaction || transaction.status !== 'PENDING_APPROVAL') {
  throw new InvalidStateError('Transaction cannot be approved in current state');
}
```

---

## 📊 FASE 4: Reporte Automático (QA)

### Paso 4.1: Estructura del QA Report

**Archivo: `docs/qa_report_DDMMYYYY.md`**

```markdown
# QA Report - Refactorización Roles y Retenciones [DD/MM/YYYY]

## Resumen Ejecutivo
- ✅ Permisos de roles implementados y validados
- ✅ Sistema de escrow (retención de fondos) funcional
- ✅ Arquitectura cumple principios (sin lógica en React)
- ✅ TypeScript estricto aplicado

## 1. Auditoría de Permisos

### 1.1 Cambios en Producto
- **Archivos modificados:**
  - `productController.js` (líneas X-Y): Agregado middleware verifyProductOwnership
  - `productRoutes.js` (líneas A-B): Protegidos endpoints PUT, PATCH, DELETE
  - `productService.js` (líneas C-D): Lógica de filtrado por seller

### 1.2 Validación de Acceso
**Test scenario 1: Seller intenta editar producto ajeno**
- Expected: 403 Forbidden ✅
- Actual: 403 Forbidden ✅

**Test scenario 2: Admin edita producto de cualquier seller**
- Expected: 200 OK ✅
- Actual: 200 OK ✅

## 2. Flujo de Retención de Fondos

### 2.1 Schema Prisma
- **Archivo:** `schema.prisma` (líneas Z-W)
- **Cambios:** Agregados TransactionStatus, tabla Transaction
- **Validación:** `npx prisma migrate dev` ejecutado sin errores ✅

### 2.2 Servicio de Transacciones
- **Archivo nuevo:** `transactionService.js`
- **Métodos implementados:**
  - `createPendingTransaction(orderId, amount)` - Crea transacción en escrow
  - `approveFundsTransfer(transactionId)` - Libera fondos
  - `getPendingBySellerr(sellerId)` - Retorna transacciones pendientes

### 2.3 Flujo de Orden Completa
**Paso 1:** Order.status = COMPLETED
**Paso 2:** Transaction creada con status = PENDING_APPROVAL
**Paso 3:** Seller.escrowBalance += amount
**Paso 4:** (Manual) Admin aprueba → Transaction.status = FUNDS_RELEASED
**Paso 5:** Seller.balance += amount, Seller.escrowBalance -= amount

**Test case - Happy path:**
- Vender producto $100 ✅
- Transacción aparece en PENDING_APPROVAL ✅
- Admin aprueba ✅
- Seller balance actualizado ✅

## 3. Cumplimiento de Arquitectura

### 3.1 Auditoría de Lógica en React
**Componentes auditados:**
- `SellerDashboard.tsx` - ✅ Solo consumo de ViewModel
- `ProductEdit.tsx` - ✅ Validaciones delegadas a service
- `TransactionList.tsx` - ✅ Solo display, sin cálculos

**Resultado:** Cero lógica de negocio en componentes ✅

### 3.2 Tipado TypeScript
- **Archivos TypeScript nuevos:** `types/transaction.ts`, `types/seller.ts`
- **Uso de `any`:** 0 instancias ✅
- **Validación de tipos:** Aplicada en todos los services

### 3.3 Cumplimiento de "Leyes"
- ✅ ViewModels + Services contienen lógica
- ✅ React solo renderiza y delega
- ✅ TypeScript estricto en todo
- ✅ Interfaces semánticas claras

## 4. Endpoints Nuevos/Modificados

| Endpoint | Método | Cambio | Rol Requerido |
|----------|--------|--------|---------------|
| `/products/:id` | GET | - | Public |
| `/products/:id` | PUT | 🔒 Verificación ownership | SELLER/ADMIN |
| `/products/:id` | DELETE | 🔒 Verificación ownership | SELLER/ADMIN |
| `/sellers/my-products` | GET | 🆕 Nuevo | SELLER |
| `/transactions/:id/approve` | POST | 🆕 Nuevo | ADMIN |
| `/transactions/pending` | GET | 🆕 Nuevo | SELLER |

## 5. Conclusiones
Esta refactorización asegura:
1. **Control de acceso granular:** Cada rol con permisos específicos
2. **Seguridad financiera:** Dinero en escrow hasta aprobación
3. **Arquitectura limpia:** Separación clara de responsabilidades
4. **Mantenibilidad:** TypeScript y tipos semánticos

**Recomendaciones para mejora futura:**
- [ ] Implementar notificaciones en tiempo real para aprobaciones
- [ ] Dashboard para Admin: analytics de transacciones pendientes
- [ ] Audit trail: log de cada aprobación/rechazo
```

### Paso 4.2: Generar Reportes Automáticos

**Crear script: `Proyecto-Back/scripts/generate-qa-report.js`**

```javascript
const fs = require('fs');
const path = require('path');

function generateQAReport() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '4-digit'
  }).replace(/\//g, '');
  
  const reportPath = path.join(__dirname, '../..', 'docs', `qa_report_${dateStr}.md`);
  
  // Verifica cambios en archivos clave
  // Genera resumen automático
  // Escribe archivo
  
  console.log(`✅ QA Report generado: ${reportPath}`);
}

generateQAReport();
```

**Ejecutar:**
```bash
node scripts/generate-qa-report.js
```

---

## ✅ Checklist de Completitud

Antes de considerar esta refactorización "lista":

- [ ] **Permisos:** Vendedor accede solo sus productos
- [ ] **Permisos:** Admin accede todos los productos
- [ ] **Escrow:** Dinero queda en PENDING_APPROVAL tras venta
- [ ] **Escrow:** Admin puede aprobar transferencia
- [ ] **Balance:** Seller ve balance actual + balance en escrow
- [ ] **Arquitectura:** Cero `any` en TypeScript
- [ ] **Arquitectura:** Cero lógica en componentes React
- [ ] **Tipos:** Todas las interfaces definidas explícitamente
- [ ] **QA Report:** Generado con casos de test validados
- [ ] **Migraciones:** Prisma migrations ejecutadas
- [ ] **Testing:** Casos de test escritos para permisos y escrow

---

## 🔗 Referencias Internas

- **Modelos:** `Proyecto-Back/prisma/schema.prisma`
- **Servicios:** `Proyecto-Back/services/{order,transaction,product,seller}Service.js`
- **Middlewares:** `Proyecto-Back/middlewares/{auth,verifyProductOwnership}.js`
- **ViewModels:** `prueba-front/src/context/viewmodels/{Seller,Transaction}ViewModel.ts`
- **Reportes:** `docs/qa_report_*.md`

---

## 💡 Ejemplo de Prompts para Usar Este Skill

1. **Refactorizar permisos de producto:**
   > "Usa el skill business-logic-refactoring para implementar la auditoría de permisos. Valida que los vendedores solo accedan sus productos."

2. **Implementar escrow:**
   > "Implementa el sistema de escrow para retención de fondos usando el skill. Asegúrate que el dinero quede en PENDING_APPROVAL hasta que Admin apruebe."

3. **Generar reporte QA:**
   > "Crea un QA report siguiendo la Fase 4 del skill. Detalla todos los cambios de arquitectura y validaciones de seguridad implementadas."

---

## 📝 Notas
- Este skill es **workspace-scoped** para `Proyecto-Back` + `prueba-front`
- Cumple arquitectura hexagonal: Servicios → ViewModels → React
- Todos los tipos deben ser explícitos; no usar `any`
- Los cambios deben ser registrados en `qa_report_*.md` para la tesis
