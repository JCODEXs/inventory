# 📦 Inventario - Sistema de Gestión de Inventario y Préstamos

Una herramienta completa para gestionar inventarios, artículos y registrar préstamos con acceso público vía QR.

## 🎯 Descripción General

**Inventario** es una aplicación web construida con el **T3 Stack** que permite a los usuarios:
- ✅ Crear y gestionar múltiples inventarios
- ✅ Organizar items en áreas/secciones
- ✅ Registrar préstamos de items
- ✅ Generar tokens públicos para compartir inventarios
- ✅ Acceder a inventarios públicos sin autenticación
- ✅ Autenticación mediante email/contraseña u OAuth (Google, Discord)

---

## 🏗️ Arquitectura del Proyecto

```
inventory/
├── src/
│   ├── app/                          # Next.js App Router (Frontend)
│   │   ├── auth/                     # Páginas de autenticación
│   │   │   ├── signin/
│   │   │   └── register/
│   │   ├── (dashboard)/              # Rutas protegidas
│   │   │   ├── inventory/            # Gestión de inventarios
│   │   │   └── inventory/[id]/       # Detalle de inventario
│   │   ├── public/                   # Rutas públicas
│   │   │   └── inventory/[token]/    # Vista pública de inventario
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/                 # NextAuth endpoints
│   │   │   ├── public/               # Endpoints públicos
│   │   │   └── trpc/                 # tRPC endpoints
│   │   ├── _components/              # Componentes React
│   │   └── layout.tsx
│   │
│   ├── server/                       # Backend (Node.js)
│   │   ├── api/
│   │   │   ├── trpc.ts               # Configuración de tRPC
│   │   │   ├── root.ts               # Router principal
│   │   │   └── routers/              # Routers tRPC
│   │   │       ├── inventory.ts
│   │   │       ├── item.ts
│   │   │       ├── loan.ts
│   │   │       ├── area.ts
│   │   │       └── auth.ts
│   │   ├── services/                 # Lógica de negocio
│   │   │   ├── inventory.service.ts
│   │   │   ├── item.service.ts
│   │   │   ├── loan.service.ts
│   │   │   ├── area.service.ts
│   │   │   └── registration.service.ts
│   │   ├── auth/                     # Configuración NextAuth
│   │   └── db.ts                     # Conexión Prisma
│   │
│   ├── trpc/                         # Cliente tRPC
│   │   ├── react.tsx                 # Hooks de React
│   │   ├── server.ts                 # Llamadas servidor-a-servidor
│   │   └── query-client.ts           # Configuración React Query
│   │
│   └── env.js                        # Validación de variables de entorno
│
├── prisma/
│   ├── schema.prisma                 # Definición de la base de datos
│   └── migrations/                   # Historial de migraciones
│
├── generated/                        # Código generado (Prisma Client)
├── public/                           # Archivos estáticos
├── package.json                      # Dependencias
├── next.config.js                    # Configuración de Next.js
├── tsconfig.json                     # Configuración de TypeScript
└── tailwind.config.ts                # Configuración de Tailwind CSS
```

---

## 📊 Modelo de Datos

### Entidades Principales

```
User (Usuario)
├── id: String (CUID)
├── email: String (único)
├── name: String
├── passwordHash: String (hash de contraseña)
├── image: String (foto del perfil)
├── emailVerified: DateTime
└── inventories: Inventory[] (relación)

Inventory (Inventario)
├── id: String (CUID)
├── name: String
├── description: String?
├── userId: String (FK User)
├── publicToken: String? (único)
├── createdAt: DateTime
├── items: Item[] (relación)
└── areas: Area[] (relación)

Item (Artículo)
├── id: String (CUID)
├── name: String
├── description: String?
├── amount: Int (cantidad disponible)
├── manualUrl: String? (enlace a manual)
├── price: Float?
├── inventoryId: String (FK Inventory)
├── areaId: String? (FK Area)
├── createdAt: DateTime
└── loans: Loan[] (relación)

Area (Zona/Sección)
├── id: String (CUID)
├── name: String
├── inventoryId: String (FK Inventory)
├── createdAt: DateTime
└── items: Item[] (relación)

Loan (Préstamo)
├── id: String (CUID)
├── borrowerName: String (nombre del quien pide prestado)
├── borrowerContact: String? (contacto)
├── startDate: DateTime (fecha de préstamo)
├── endDate: DateTime? (fecha de devolución)
├── returned: Boolean (devuelto?)
├── notes: String? (notas)
└── itemId: String (FK Item)
```

---

## 🔄 Flujos de Información

### 1. **Flujo de Autenticación**

```
┌─────────────────────────────────────────┐
│          Usuario Nuevo                   │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────▼──────────┐
        │  Accede a /auth/   │
        │   /register        │
        └────────┬────────────┘
                 │
     ┌───────────▼────────────┐
     │  Completa formulario:  │
     │  - Email              │
     │  - Nombre             │
     │  - Contraseña (8+)    │
     │  - Confirmar contraseña
     └────────┬────────────┐
              │            │
        ┌─────▼────┐  ┌────▼──────┐
        │ tRPC     │  │ OAuth      │
        │ auth.    │  │ (Google/   │
        │register  │  │ Discord)   │
        └────┬─────┘  └────┬───────┘
             │             │
        ┌────▼─────────────▼──┐
        │ Hashear contraseña  │
        │ (bcryptjs)          │
        └────┬────────────────┘
             │
        ┌────▼─────────────────┐
        │ Crear User en DB     │
        │ + Session (NextAuth) │
        └────┬─────────────────┘
             │
        ┌────▼─────────────────┐
        │ Redirigir a /        │
        │ (Dashboard)          │
        └─────────────────────┘
```

### 2. **Flujo de Gestión de Inventarios**

```
┌──────────────────────────────────┐
│   Usuario Autenticado            │
│   /inventory (Dashboard)         │
└──────────────────┬───────────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
 ┌──▼──────────────┐    ┌────────▼──────┐
 │ Crear Inventario│    │ Ver Inventarios│
 │ - Nombre        │    │ - Listar todos │
 │ - Descripción   │    │ - Por usuario  │
 └──┬──────────────┘    └────┬──────────┘
    │                        │
    │ tRPC: inventory.create │
    │                        │
    ▼                        ▼
 ┌────────────────────────────────┐
 │ DB: create Inventory            │
 │ + Crear áreas por defecto (?)   │
 └────────────┬───────────────────┘
              │
         ┌────▼──────────┐
         │ Redirigir a   │
         │ /inventory/id │
         └───────────────┘
              │
    ┌─────────▼────────────┐
    │ Dentro del Inventario │
    │ - Ver items          │
    │ - Crear items        │
    │ - Crear áreas        │
    │ - Generar token      │
    │   público            │
    └──────────────────────┘
```

### 3. **Flujo de Creación de Items**

```
┌──────────────────────────────────┐
│  En /inventory/[id]              │
│  "Agregar Item"                  │
└──────────────────┬───────────────┘
                   │
    ┌──────────────▼──────────────┐
    │ Formulario Modal:           │
    │ - Nombre                    │
    │ - Descripción              │
    │ - Cantidad                  │
    │ - Área (dropdown)          │
    │ - URL Manual (opcional)     │
    │ - Precio (opcional)         │
    └──────────────┬──────────────┘
                   │
        ┌──────────▼─────────────┐
        │ tRPC: item.create      │
        │ Inputs: {              │
        │  inventoryId, name...  │
        │ }                       │
        └──────────┬─────────────┘
                   │
        ┌──────────▼───────────────────┐
        │ Validar ownership Inventario  │
        │ (userId debe coincidir)       │
        └──────────┬───────────────────┘
                   │
        ┌──────────▼──────────────┐
        │ DB: create Item         │
        └──────────┬──────────────┘
                   │
        ┌──────────▼──────────────┐
        │ Actualizar UI           │
        │ (React Query refetch)   │
        └──────────────────────┘
```

### 4. **Flujo de Préstamo de Items**

```
┌──────────────────────────────────┐
│  Ver Item en Inventario          │
│  [Botón: "Prestar"]              │
└──────────────────┬───────────────┘
                   │
    ┌──────────────▼──────────────┐
    │ Formulario Modal:           │
    │ - Nombre quien pide         │
    │ - Contacto (opcional)       │
    │ - Notas (opcional)          │
    └──────────────┬──────────────┘
                   │
        ┌──────────▼─────────────┐
        │ tRPC: loan.create      │
        │ {itemId, borrower...}  │
        └──────────┬─────────────┘
                   │
        ┌──────────▼──────────────────────┐
        │ Validaciones:                   │
        │ 1. Item existe y es del usuario │
        │ 2. No hay préstamo activo       │
        └──────────┬─────────────────────┘
                   │
        ┌──────────▼────────────────┐
        │ DB: create Loan           │
        │ - startDate: now()        │
        │ - returned: false         │
        └──────────┬────────────────┘
                   │
        ┌──────────▼──────────────────┐
        │ Actualizar estado Item       │
        │ (mostrar como prestado)      │
        └──────────────────────┘
                   │
        ┌──────────▼──────────────┐
        │ [Botón: "Devolver"]    │
        │ - tRPC: loan.returnItem│
        │ - DB: update Loan      │
        │   endDate: now()       │
        │   returned: true       │
        └──────────────────────┘
```

### 5. **Flujo de Compartir Inventario (Token Público)**

```
┌──────────────────────────────────────┐
│  Usuario en /inventory/[id]          │
│  [Botón: "Hacer Público"]            │
└──────────────────┬────────────────────┘
                   │
        ┌──────────▼────────────────────┐
        │ tRPC: inventory.               │
        │ enablePublicAccess             │
        │ Input: { id: inventoryId }     │
        └──────────┬─────────────────────┘
                   │
        ┌──────────▼────────────────────┐
        │ Generar UUID aleatorio         │
        │ (publicToken)                  │
        └──────────┬─────────────────────┘
                   │
        ┌──────────▼──────────────────────┐
        │ DB: update Inventory            │
        │ publicToken = UUID              │
        └──────────┬──────────────────────┘
                   │
        ┌──────────▼──────────────────────┐
        │ Mostrar enlace público:         │
        │ https://app.com/public/         │
        │ inventory/[publicToken]         │
        │                                 │
        │ + Código QR                     │
        └──────────────────────────────────┘
```

---

## 🌐 API Pública

### Endpoint: Obtener Inventario Público

**URL:**
```
GET /api/public/inventory/[token]
```

**Parámetros:**
- `token` (string): Token público del inventario

**Respuesta (200 OK):**
```json
{
  "id": "cid123abc...",
  "name": "Inventario de Herramientas",
  "areas": [
    {
      "id": "area123",
      "name": "Tornillos"
    }
  ],
  "items": [
    {
      "id": "item123",
      "name": "Taladro",
      "description": "Taladro eléctrico 800W",
      "amount": 2,
      "manualUrl": "https://...",
      "price": 150.50,
      "areaId": "area123",
      "loans": [
        {
          "id": "loan456",
          "borrowerName": "Juan Pérez",
          "borrowerContact": "555-1234",
          "startDate": "2026-03-30T10:00:00Z",
          "returned": false,
          "notes": "Entrega en viernes"
        }
      ]
    }
  ]
}
```

**Respuesta (404 Not Found):**
```json
{
  "error": "Not found"
}
```

**Características:**
- ✅ No requiere autenticación
- ✅ Retorna inventario, áreas e items
- ✅ Incluye préstamos activos de cada item
- ✅ Datos de quien está pidiendo prestado

**Caso de Uso:**
- Ver inventario compartido sin login
- Generar QR para compartir
- Ver disponibilidad de items
- Ver quién tiene prestado cada item

---

## 🔐 Seguridad y Autorización

### Rutas Protegidas (Requieren Autenticación)

Todos los endpoints tRPC en `protectedProcedure`:
```typescript
// Solo usuarios autenticados
- inventory.create
- inventory.getAll
- inventory.getById
- inventory.enablePublicAccess
- item.create
- item.getByInventory
- item.getStatus
- item.delete
- loan.create
- loan.returnItem
```

### Validaciones de Propiedad

Cada operación verifica que el recurso pertenece al usuario:

```typescript
// Ejemplo: Crear item
const inventory = await db.inventory.findFirst({
  where: {
    id: data.inventoryId,
    userId  // ← Validar que es del usuario actual
  }
});

if (!inventory) {
  throw new Error("Inventory not found or unauthorized");
}
```

### Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/inventory"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="random-secret-key-here"

# OAuth - Google
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# OAuth - Discord
DISCORD_CLIENT_ID="..."
DISCORD_CLIENT_SECRET="..."

# Email (para magic links)
RESEND_API_KEY="..."
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js 18+
- PostgreSQL
- npm o pnpm

### Pasos de Instalación

1. **Clonar repositorio**
   ```bash
   git clone <repo-url>
   cd inventory
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus valores
   ```

4. **Inicializar base de datos**
   ```bash
   npm run db:migrate
   ```

5. **Generar cliente Prisma**
   ```bash
   npm run db:generate
   ```

6. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

7. **Acceder a la aplicación**
   ```
   http://localhost:3000
   ```

---

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor con hot-reload

# Base de datos
npm run db:generate     # Genera cliente Prisma
npm run db:migrate      # Aplica migraciones
npm run db:push         # Sincroniza schema con BD
npm run db:studio       # Abre Prisma Studio

# Calidad de código
npm run lint            # Ejecuta ESLint
npm run lint:fix        # Arregla errores automáticos
npm run format:check    # Verifica formato Prettier
npm run format:write    # Formatea código

# Build y producción
npm run build           # Construye para producción
npm run preview         # Vista previa de build
npm run start           # Inicia servidor producción

# Verificación
npm run check           # ESLint + TypeScript check
npm run typecheck       # Solo TypeScript
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15** - Framework React fullstack
- **React 19** - Librería UI
- **Tailwind CSS** - Estilos
- **Framer Motion** - Animaciones
- **tRPC** - RPC type-safe

### Backend
- **Node.js** - Runtime JavaScript
- **tRPC** - RPC type-safe
- **Prisma** - ORM
- **NextAuth.js** - Autenticación

### Base de Datos
- **PostgreSQL** - BD relacional

### Otros
- **TypeScript** - Tipado estático
- **Zod** - Validación de esquemas
- **bcryptjs** - Hashing de contraseñas
- **QRCode** - Generación de QR
- **React Query** - Gestión de estado servidor
- **Sileo** - Toasts/notificaciones

---

## 📚 Estructura de Servicios

### InventoryService
```typescript
{
  create(userId, {name, description})           // Crear inventario
  getAll(userId)                                // Listar todos del usuario
  getById(userId, id)                           // Obtener detalle
  getOrCreateDefaultInventory(userId)           // Default o crear
  enablePublicAccess(inventoryId, userId)       // Generar token
}
```

### ItemService
```typescript
{
  create(userId, {inventoryId, name, ...})      // Crear item
  getByInventory(userId, inventoryId)           // Items del inventario
  getStatus(userId, inventoryId)                // Estado total
  delete(userId, itemId)                        // Eliminar item
}
```

### LoanService
```typescript
{
  create(userId, {itemId, borrowerName, ...})   // Crear préstamo
  returnItem(userId, loanId)                    // Marcar como devuelto
}
```

### AreaService
```typescript
{
  create(userId, {inventoryId, name})           // Crear área
  getByInventory(userId, inventoryId)           // Áreas del inventario
  delete(userId, areaId)                        // Eliminar área
}
```

### RegistrationService
```typescript
{
  register({name, email, password})             // Registrar usuario
}
```

---

## 🔄 Flujos de Componentes

### AuthFlow
```
LoginPage → SignInPage
           ↓
       Validación
           ↓
       NextAuth
           ↓
    Dashboard (/)
```

### InventoryFlow
```
/inventory (lista)
    ↓
/inventory/[id] (detalle)
    ├─ Ver items
    ├─ Crear item
    ├─ Crear área
    ├─ Hacer público (generar token)
    └─ Préstamos
       ├─ Crear préstamo
       └─ Devolver item
```

### PublicFlow
```
/public/inventory/[token] (sin login)
    ├─ Ver inventario
    ├─ Ver items
    ├─ Ver áreas
    ├─ Ver préstamos activos
    └─ Generar QR
```

---

## 🎯 Casos de Uso Principales

### 1. **Gestor de Herramientas**
- Empresa con herramientas compartidas
- Registra quién tiene qué
- Acceso público para consultar disponibilidad

### 2. **Biblioteca Personal**
- Gestionar libros
- Rastrear préstamos a amigos
- Compartir catálogo

### 3. **Inventario de Equipos**
- Oficina con equipos
- Control de dónde está cada uno
- Quién lo tiene en préstamo

### 4. **Control de Almacén**
- Organizar por áreas/secciones
- Ver stock disponible
- Rastrear préstamos internos

---

## 🐛 Debugging

### Logs de Desarrollo
```bash
# Ver logs de tRPC
npm run dev  # Ver en console

# Ver BD con Prisma Studio
npm run db:studio

# Logs detallados
DEBUG=* npm run dev
```

### Problemas Comunes

**Error: "Inventory not found or unauthorized"**
- Verificar que userId coincide
- Usar ID correcto de inventario

**Error: "Item already loaned"**
- Item ya tiene préstamo activo
- Devolver el item primero

**Error de conexión a BD**
- Verificar DATABASE_URL
- Verificar servidor PostgreSQL

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisar logs en consola
2. Verificar variables de entorno
3. Checar BD con Prisma Studio
4. Revisar errores en NextAuth

---

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.

---

## 🎓 Aprendizaje

Este proyecto demuestra:
- ✅ Arquitectura fullstack con Next.js
- ✅ Autenticación con NextAuth.js
- ✅ ORM con Prisma
- ✅ API type-safe con tRPC
- ✅ Gestión de estado con React Query
- ✅ Componentes reutilizables
- ✅ Flujos de datos complejos
- ✅ Validación con Zod
- ✅ Diseño responsivo con Tailwind

---

**Última actualización:** 30 de Marzo de 2026
