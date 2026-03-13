# Technical Manager — Documento Técnico

**Versión:** 1.0
**Fecha:** Marzo 2026
**Clasificación:** Técnico / Interno

---

## 1. Visión General del Sistema

**Technical Manager** es una aplicación web SaaS multi-tenant construida con Next.js 16. Cada tenant (tienda) tiene su propio espacio de trabajo aislado, su subdominio de tracking público y acceso a un conjunto de módulos de gestión operativa.

La plataforma corre en Vercel (serverless) y utiliza Supabase como backend de base de datos PostgreSQL gestionado. Toda la lógica de negocio se procesa en API Routes de Next.js.

---

## 2. Stack Tecnológico

### Frontend
| Tecnología | Versión | Rol |
|---|---|---|
| Next.js | 16 | Framework principal (App Router) |
| React | 19 | UI |
| TypeScript | Latest | Tipado estático |
| Tailwind CSS | v4 | Estilos (CSS-first, sin config file) |
| shadcn/ui | Latest | Componentes UI (sobre Radix UI) |
| Lucide React | Latest | Iconos (incluido por shadcn) |
| React Icons | Latest | Iconos adicionales |
| SWR | Latest | Data fetching y caché del cliente |

### Backend / API
| Tecnología | Versión | Rol |
|---|---|---|
| Next.js API Routes | 16 | Endpoints REST serverless |
| Prisma ORM | 7.3.0 | ORM con PostgreSQL adapter |
| Supabase | Latest | PostgreSQL gestionado + Storage |
| `@supabase/supabase-js` | Latest | SDK para Storage (imágenes) |
| `pg` | Latest | Cliente PostgreSQL directo |

### Utilidades
| Librería | Uso |
|---|---|
| `papaparse` | Parsing de archivos CSV (importación masiva) |
| `xlsx` | Generación de archivos Excel (exportación) |
| `browser-image-compression` | Compresión de imágenes en el cliente antes del upload |
| `date-fns` | Manipulación y formateo de fechas |
| `nanoid` | Generación de IDs únicos cortos |

### Infraestructura
| Servicio | Uso |
|---|---|
| Vercel | Hosting, deploy automático, analytics |
| Supabase | PostgreSQL + Object Storage (imágenes) |

---

## 3. Arquitectura del Sistema

### 3.1 Modelo Multi-Tenant

Cada tienda registrada recibe un `Store` en la base de datos. Todos los recursos (clientes, órdenes, productos, usuarios, sucursales) están relacionados a un `storeId`. No existen datos compartidos entre tiendas excepto el catálogo público de marcas y modelos de dispositivos (`DeviceBrand`, `DeviceModel`).

```
Store
 ├── Users (OWNER | MANAGER | TECHNICIAN)
 ├── Branches (sucursales)
 │    └── UserBranch (asignación de técnicos a sucursales)
 ├── StoreSettings (branding, slug, redes sociales, horarios)
 ├── WorkOrders
 │    ├── OrderPhoto
 │    ├── OrderStatusLog
 │    ├── OrderNote
 │    └── OrderRating
 ├── Clients
 ├── Receipts
 │    └── ReceiptItems
 ├── Items (inventario)
 │    └── Category
 └── PaymentMethodCommission
```

### 3.2 Patrones Arquitectónicos

**Server Components por defecto**
Todas las páginas son React Server Components a menos que se requiera interactividad (eventos del DOM, hooks de estado). El directorio `app/` sigue el App Router de Next.js 16.

**"use client" estrictamente necesario**
Solo los componentes que usan `useState`, `useEffect`, `useContext`, handlers de eventos o librerías que requieren el entorno browser llevan `"use client"`. La directiva se coloca en el nivel más bajo posible del árbol de componentes.

**Modularidad de componentes**
Ningún archivo de componente supera las 500 líneas. Los formularios, tablas, modales y secciones complejas se extraen a componentes separados. Los índices de páginas se mantienen como orquestadores ligeros.

**Plan Guard**
La función `checkReadOnly()` de `/lib/plan-guard.ts` verifica si el plan de la tienda permite escritura. Los planes DEMO o expirados retornan respuestas de solo lectura desde las API routes.

### 3.3 Flujo de Autenticación

1. Login: `POST /api/auth/login` valida credenciales y retorna datos de usuario + sucursales accesibles
2. La sesión se almacena en `localStorage` y se inyecta en el contexto global via `DashboardContext`
3. Las rutas protegidas verifican la sesión con `/lib/auth-check.ts` en cada API route
4. Los roles (`OWNER`, `MANAGER`, `TECHNICIAN`) controlan qué endpoints y secciones de UI son visibles

---

## 4. Esquema de Base de Datos

### Entidades Principales

#### Store
```prisma
model Store {
  id             String    @id @default(cuid())
  name           String
  plan           PlanType  @default(DEMO)
  planExpiresAt  DateTime?
  createdAt      DateTime  @default(now())

  users          User[]
  branches       Branch[]
  items          Item[]
  receipts       Receipt[]
  clients        Client[]
  workOrders     WorkOrder[]
  settings       StoreSettings?
}
```

#### User
```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   (hashed)
  role      Role     @default(TECHNICIAN)
  storeId   String
  store     Store    @relation(...)
  branches  UserBranch[]
}

enum Role { OWNER MANAGER TECHNICIAN }
```

#### WorkOrder (entidad central)
```prisma
model WorkOrder {
  id             String      @id @default(cuid())
  orderCode      String      @unique
  deviceModel    String
  reportedFault  String
  agreedPrice    Decimal
  partsCost      Decimal?
  status         OrderStatus @default(RECIBIDO)
  warrantyDays   Int?
  warrantyExpiresAt DateTime?
  warrantyStatus WarrantyStatus?

  clientId       String
  technicianId   String?
  createdById    String
  branchId       String

  photos         OrderPhoto[]
  statusLogs     OrderStatusLog[]
  notes          OrderNote[]
  rating         OrderRating?
}

enum OrderStatus {
  RECIBIDO
  EN_REVISION
  ESPERANDO_REPUESTO
  EN_REPARACION
  LISTO_PARA_RETIRAR
  ENTREGADO
  SIN_REPARACION
}
```

#### Client
```prisma
model Client {
  id          String    @id @default(cuid())
  name        String
  phone       String
  email       String?
  notes       String?
  tags        ClientTag @default(NEW)
  visitCount  Int       @default(0)
  totalSpent  Decimal   @default(0)
  storeId     String
  workOrders  WorkOrder[]
}

enum ClientTag { NEW RECURRING FREQUENT VIP }
```

#### Receipt
```prisma
model Receipt {
  id             String        @id @default(cuid())
  receiptNumber  String        @unique
  status         ReceiptStatus @default(PENDING)
  paymentMethod  String
  subtotal       Decimal
  commission     Decimal?
  total          Decimal
  storeId        String
  items          ReceiptItem[]
}
```

#### Item (Inventario)
```prisma
model Item {
  id          String   @id @default(cuid())
  sku         String
  name        String
  costPrice   Decimal
  salePrice   Decimal
  stock       Int      @default(0)
  imageUrl    String?
  storeId     String
  branchId    String?
  categoryId  String?

  @@unique([storeId, sku])
}
```

#### Branch (Sucursal)
```prisma
model Branch {
  id              String  @id @default(cuid())
  name            String
  slug            String  @unique
  phone           String?
  address         String?
  googleMapsUrl   String?
  businessHours   Json?
  facebook        String?
  instagram       String?
  tiktok          String?
  storeId         String
  users           UserBranch[]
  items           Item[]
  workOrders      WorkOrder[]
}
```

### Enums Adicionales
```
PlanType: DEMO | BASIC | PRO | ENTERPRISE
NoteType: INTERNAL | TECHNICIAN
WarrantyStatus: ACTIVE | EXPIRED | CLAIMED
ReceiptStatus: PENDING | COMPLETED | CANCELLED
```

---

## 5. API Routes

### Estructura General

Todas las API routes siguen estas convenciones:
- Retornan JSON siempre
- Errores de Prisma son capturados y traducidos al español (`P2002` → "Ya existe un registro con ese valor", `P2025` → "Registro no encontrado")
- `console.error` obligatorio en todos los `catch`
- Uploads usan `Uint8Array` (no `Buffer.from()`) para compatibilidad serverless
- Autenticación verificada con `auth-check.ts` en rutas protegidas

### Endpoints por Módulo

#### Autenticación
```
POST /api/auth/register    → Crear tienda + usuario owner
POST /api/auth/login       → Login, retorna usuario + sucursales
GET  /api/auth/me          → Info del usuario actual
```

#### Órdenes de Trabajo
```
GET    /api/work-orders              → Listar (filtros: storeId, branchId, status, technicianId)
POST   /api/work-orders              → Crear orden (auto-genera código OT-YYYYMMDD-###)
GET    /api/work-orders/[id]         → Detalle de orden
PUT    /api/work-orders/[id]         → Editar orden
PUT    /api/work-orders/[id]/status  → Cambiar estado (registra log + dispara WhatsApp)
POST   /api/work-orders/[id]/photos  → Subir fotos del equipo
POST   /api/work-orders/[id]/notes   → Agregar nota interna
POST   /api/work-orders/[id]/rating  → Registrar valoración post-entrega
```

#### Recibos / Ventas
```
GET    /api/receipts        → Listar recibos
POST   /api/receipts        → Crear recibo (descuenta stock automáticamente)
GET    /api/receipts/[id]   → Detalle
PUT    /api/receipts/[id]   → Editar
PUT    /api/receipts/[id]/status  → Marcar COMPLETED / CANCELLED
```

#### Clientes
```
GET    /api/clients          → Listar (filtro por tienda)
POST   /api/clients          → Crear cliente
GET    /api/clients/[id]     → Detalle con historial completo
PUT    /api/clients/[id]     → Editar
GET    /api/clients/search   → Buscar por nombre o teléfono
```

#### Inventario
```
GET    /api/items            → Listar productos
POST   /api/items            → Crear producto
GET    /api/items/[id]       → Detalle
PUT    /api/items/[id]       → Editar
POST   /api/items/bulk       → Importación masiva por CSV
GET    /api/items/check-skus → Validar SKUs antes de importar
```

#### Sucursales
```
GET    /api/branches               → Listar sucursales
POST   /api/branches               → Crear sucursal
GET    /api/branches/[id]          → Detalle
PUT    /api/branches/[id]          → Editar
GET    /api/branches/my-branches   → Sucursales del usuario actual
GET    /api/branches/ensure-default → Asegura que existe sucursal por defecto
```

#### Configuración y Estadísticas
```
GET/PUT  /api/store-settings             → Branding, datos de contacto, redes sociales
POST     /api/store-settings/invite-code → Generar código de invitación para técnicos
GET      /api/stats/business             → KPIs del dashboard
GET      /api/stats/cash-summary         → Resumen de caja por período
GET      /api/commissions                → Comisiones por método de pago
GET      /api/users                      → Miembros del equipo
POST     /api/export                     → Generar Excel (reparaciones, clientes, financiero)
```

#### Tracking Público (sin autenticación)
```
GET  /api/tracking?slug=X&orderCode=Y   → Estado de orden para cliente
GET  /api/tracking/store?slug=X         → Info de tienda + productos destacados
POST /api/tienda/orders                  → Crear pedido desde tienda online pública
```

#### Uploads
```
POST  /api/upload               → Upload genérico a Supabase Storage
POST  /api/upload/order-photos  → Upload fotos de órdenes (con compresión)
POST  /api/upload/logo          → Upload logo de tienda
```

---

## 6. Estructura de Directorios

```
technical-manager/
├── app/
│   ├── (public)/
│   │   ├── page.tsx              # Landing page
│   │   ├── register/             # Registro de nueva tienda
│   │   ├── login/                # Autenticación
│   │   └── [slug]/               # Tracking público del cliente
│   │        ├── page.tsx         # Búsqueda por teléfono/código
│   │        ├── tienda/          # Tienda online pública
│   │        └── rating/[id]/     # Formulario de valoración
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard principal (KPIs)
│   │   ├── ordenes/              # Gestión de órdenes de trabajo
│   │   ├── recibos/              # Recibos y ventas
│   │   ├── inventario/           # Inventario de productos
│   │   ├── clientes/             # Directorio de clientes
│   │   ├── pos/                  # Punto de venta rápido
│   │   ├── caja/                 # Resumen de caja
│   │   ├── estadisticas/         # Analytics del negocio
│   │   ├── sales/                # Comparativa de ventas mensuales
│   │   ├── exportar/             # Exportación de datos
│   │   └── configuracion/        # Settings de la tienda
│   │        ├── sucursales/      # Gestión de sucursales
│   │        ├── equipo/          # Gestión de usuarios
│   │        ├── comisiones/      # Comisiones por pago
│   │        ├── categorias/      # Categorías de productos
│   │        └── dispositivos/    # Catálogo de marcas/modelos
│   └── api/                      # API Routes (ver sección 5)
├── components/
│   ├── ui/                       # Componentes shadcn/ui generados
│   ├── dashboard/                # Componentes del panel de control
│   ├── orders/                   # Componentes de órdenes
│   ├── clients/                  # Componentes de clientes
│   ├── inventory/                # Componentes de inventario
│   ├── pos/                      # Componentes de punto de venta
│   └── public/                   # Componentes de páginas públicas
├── lib/
│   ├── prisma.ts                 # Singleton Prisma client
│   ├── db.ts                     # Exports de base de datos
│   ├── auth-check.ts             # Validación de rutas protegidas
│   ├── branch-access.ts          # Control de acceso por sucursal
│   ├── plan-guard.ts             # Enforcement de límites por plan
│   ├── supabase.ts               # Cliente Supabase Storage
│   ├── whatsapp.ts               # Builder de mensajes WhatsApp
│   └── utils.ts                  # cn(), formatCurrency(), helpers
├── contexts/
│   ├── DashboardContext.tsx       # Estado global del dashboard
│   └── CartContext.tsx            # Estado del carrito (tienda online)
├── prisma/
│   └── schema.prisma             # Definición del esquema de datos
└── docs/                         # Documentación del proyecto
```

---

## 7. Flujos de Negocio Principales

### 7.1 Creación de Orden de Trabajo

```
1. Técnico llena formulario: cliente, dispositivo, falla, precio acordado
2. Frontend valida campos requeridos
3. POST /api/work-orders
   ├── Verifica autenticación y plan
   ├── Genera código: OT-YYYYMMDD-{consecutivo}
   ├── Crea WorkOrder en BD
   ├── Incrementa visitCount del Client
   ├── Registra log de estado inicial (RECIBIDO)
   └── Dispara mensaje WhatsApp de confirmación (lib/whatsapp.ts)
4. Redirige a detalle de la orden creada
```

### 7.2 Cambio de Estado de Reparación

```
1. Técnico selecciona nuevo estado en la UI
2. PUT /api/work-orders/[id]/status
   ├── Verifica permisos (técnico solo puede cambiar sus órdenes)
   ├── Actualiza status en WorkOrder
   ├── Crea registro en OrderStatusLog (con userId y timestamp)
   ├── Si estado = ENTREGADO:
   │    ├── Marca warranty como ACTIVE si hay warrantyDays
   │    └── Actualiza totalSpent del Client
   └── Dispara mensaje WhatsApp de notificación al cliente
3. El cliente ve el cambio en tiempo real en /[slug]
```

### 7.3 Venta en Punto de Venta

```
1. Operador selecciona productos y cantidades
2. Elige método de pago
3. POST /api/receipts
   ├── Calcula subtotal, comisión y total
   ├── Crea Receipt con status PENDING
   ├── Crea ReceiptItem por cada producto
   └── Decrementa stock de cada Item
4. Recibo queda listo para imprimir o compartir
```

### 7.4 Seguimiento Público del Cliente

```
1. Cliente accede a: technicalmanager.app/[slug]
2. Ingresa su número de teléfono o código de orden
3. GET /api/tracking?slug=X&orderCode=Y (sin autenticación)
   ├── Busca tienda por slug
   ├── Busca orden por código o teléfono del cliente
   └── Retorna: estado, modelo, falla, técnico asignado, fotos (si habilitado), garantía
4. Frontend muestra estado visual con color por etapa
5. Botón de WhatsApp directo con el número de la sucursal
```

---

## 8. Manejo de Errores

### En API Routes
- Todo `catch` ejecuta `console.error` y retorna HTTP 500 con mensaje descriptivo en español
- Errores Prisma específicos:
  - `P2002` (unique constraint) → "Ya existe un registro con ese valor"
  - `P2025` (record not found) → "Registro no encontrado"
- Nunca se retorna `"Error del servidor"` genérico cuando la causa es conocida

### En el Cliente
- Uploads: validación de tipo de archivo en JS antes de enviar al servidor
- Operaciones async: siempre muestran mensaje de error en rojo al usuario
- Nunca se falla silenciosamente: todo error tiene feedback visual

---

## 9. Sistema de Almacenamiento de Imágenes

Las imágenes (fotos de órdenes, logos) se almacenan en **Supabase Storage**:

1. El cliente comprime la imagen con `browser-image-compression` antes del upload
2. Se envía como `FormData` a la API route correspondiente
3. La API convierte a `Uint8Array` (no `Buffer.from()`) para compatibilidad serverless
4. Se sube a Supabase Storage con el SDK oficial
5. Se guarda la URL pública en la base de datos

---

## 10. Integración WhatsApp

El archivo `/lib/whatsapp.ts` contiene los builders de mensajes para:
- Confirmación de recepción de equipo
- Notificación de cambio de estado
- Aviso de equipo listo para retirar

**Estado actual:** Los mensajes se construyen pero la integración con la API de WhatsApp Business está pendiente de implementación. Las funciones actualmente hacen `console.log` del mensaje generado.

**Integración planeada:** WhatsApp Business API (Meta) o proveedor tercero (Twilio, Infobip).

---

## 11. Consideraciones de Seguridad

- Contraseñas hasheadas en base de datos (nunca en texto plano)
- Toda API route protegida verifica sesión antes de operar
- `storeId` siempre verificado: un usuario no puede acceder a datos de otra tienda
- Control de roles: TECHNICIAN no accede a endpoints financieros
- Plan guard: planes expirados pasan a solo lectura automáticamente
- Uploads: validación de tipo MIME en cliente y servidor

---

## 12. Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Aplicación
NEXTAUTH_SECRET=...
NEXT_PUBLIC_APP_URL=https://...
```

---

## 13. Limitaciones Actuales y Roadmap Técnico

### Limitaciones Conocidas
| Limitación | Estado |
|---|---|
| WhatsApp Business API no conectada | Pendiente |
| Google Reviews redirect no implementado | Pendiente |
| Sin autenticación basada en tokens JWT (usa localStorage) | A revisar |
| Sin rate limiting en API routes públicas | Pendiente |
| Sin tests automatizados | Pendiente |

### Roadmap Técnico
1. **Corto plazo:** Completar módulo de estadísticas, finalizar exportación Excel, activar valoraciones → reseñas Google
2. **Mediano plazo:** Integrar WhatsApp Business API, implementar JWT + refresh tokens, agregar rate limiting
3. **Largo plazo:** Versión móvil nativa (React Native), integración con proveedores de repuestos, API pública para integraciones

---

*Documento generado en base al análisis del código fuente del proyecto — Marzo 2026.*
