# 🔄 Flujos de Trabajo Detallados - Inventario

Documentación extensiva de todos los flujos de información y trabajo en la herramienta.

---

## 📋 Índice

1. [Flujos de Autenticación](#flujos-de-autenticación)
2. [Flujos de Gestión de Inventario](#flujos-de-gestión-de-inventario)
3. [Flujos de Items](#flujos-de-items)
4. [Flujos de Préstamos](#flujos-de-préstamos)
5. [Flujos de Sharing Público](#flujos-de-sharing-público)
6. [Flujos de Datos (Comunicación Cliente-Servidor)](#flujos-de-datos-comunicación-cliente-servidor)
7. [Diagrama de Componentes](#diagrama-de-componentes)

---

## Flujos de Autenticación

### Registro de Usuario (Register)

```
┌─────────────────────────────────────────────────────────────────┐
│                     USUARIO NUEVO                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                   ┌─────────▼──────────┐
                   │   GET /auth/       │
                   │   /register        │
                   └─────────┬──────────┘
                             │
           ┌─────────────────┴─────────────────┐
           │                                   │
      ┌────▼─────────────────┐        ┌──────▼──────────┐
      │  Formulario Manual    │        │  OAuth (Social)  │
      │  - Email             │        │  - Google        │
      │  - Nombre            │        │  - Discord       │
      │  - Password          │        └──────┬──────────┘
      │  - Confirm Password  │               │
      └────┬─────────────────┘               │
           │                                 │
      ┌────▼─────────────────────────────────▼──┐
      │                                         │
      │  POST /api/trpc/auth.register           │
      │  (RegisterPage.tsx → api.auth.register) │
      │                                         │
      └────┬────────────────────────────────────┘
           │
      ┌────▼─────────────────────┐
      │   authRouter.register    │
      │   (server/api/routers/   │
      │    auth.ts)              │
      └────┬─────────────────────┘
           │
      ┌────▼──────────────────────────────────┐
      │  VALIDACIONES ZODB                    │
      │  ✓ Email válido                      │
      │  ✓ Contraseña >= 8 caracteres        │
      │  ✓ Coinciden contraseñas             │
      │  ✓ Email no existe                   │
      └────┬───────────────────────────────┬─┘
           │ OK                      │ ERROR
      ┌────▼──────────────────┐   │
      │  Hash password con    │   │
      │  bcryptjs             │   │
      └────┬───────────────────┘  │
           │                      │
      ┌────▼──────────────────────────────┐
      │  DB: Create User                  │
      │  - id: CUID auto                  │
      │  - email                          │
      │  - name                           │
      │  - passwordHash (bcrypt)          │
      │  - createdAt: now()               │
      └────┬──────────────┬─────────────┘
           │ Éxito        │ Error (email duplicado)
           │              └──→ Enviar error al cliente
      ┌────▼──────────────────────┐
      │  NextAuth signIn auto.    │
      │  (credentials provider)   │
      └────┬──────────────────────┘
           │
      ┌────▼──────────────────────────────────┐
      │  DB: Create Session (NextAuth)        │
      │  - sessionToken: UUID                 │
      │  - expires: 30 días                   │
      └────┬────────────────────────────────┬─┘
           │ OK                      │ ERROR
      ┌────▼──────────────┐        └──→ Mostrar error
      │  Cookie Session   │
      │  (HttpOnly)       │
      └────┬──────────────┘
           │
      ┌────▼─────────────────────────────┐
      │  Redirect → /                    │
      │  (Dashboard)                      │
      └──────────────────────────────────┘
```

### Inicio de Sesión (Sign In)

```
┌─────────────────────────────────────────────────────────────────┐
│              USUARIO EXISTENTE EN LOGIN                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                   ┌─────────▼──────────┐
                   │   GET /auth/       │
                   │   /signin          │
                   └─────────┬──────────┘
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
   ┌────▼──────────────────────┐    ┌───────────▼──────────┐
   │  Método: Contraseña       │    │  Método: Magic Link  │
   │  - Email                  │    │  - Email             │
   │  - Contraseña             │    └───────────┬──────────┘
   └────┬──────────────────────┘                │
        │                                       │
   ┌────▼─────────────────────────────┐         │
   │ POST /api/trpc/auth.signIn        │        │
   │ (o signIn("credentials"))         │        │
   └────┬─────────────────────────────┘        │
        │                                       │
   ┌────▼──────────────────────────────────┐    │
   │  DB: findUser(email)                 │    │
   │  if (!user) → error                  │    │
   └────┬──────────────────────────────────┘   │
        │                                       │
   ┌────▼──────────────────────────────┐       │
   │  Validar password con bcryptjs    │       │
   │  compare(input, passwordHash)     │       │
   └────┬──────────────────┬───────────┘       │
        │ Correcto         │ Incorrecto        │
   ┌────▼──────────┐    └──→ Error: "Credenciales inválidas"
   │ NextAuth      │
   │ signIn OK     │
   └────┬──────────┘
        │
   ┌────▼──────────────────────┐
   │  Create Session           │
   │  (NextAuth automático)    │
   └────┬──────────────────────┘
        │
   ┌────▼───────────────────────────┐
   │  Cookie + Redirect → /         │
   │  (o Redirect guardado)         │
   └───────────────────────────────┘
        │
        └─→ POST /api/auth/callback/credentials (interno NextAuth)
            ↓
            Validar en /api/auth/[...nextauth]/route.ts
            ↓
            DB check + session creation
            ↓
            Redirect a callbackUrl
```

### OAuth Flow (Google/Discord)

```
┌──────────────────────────────────────────────────────────────┐
│         USUARIO ELIGE: Continuar con Google/Discord         │
└────────────────────────┬─────────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │  handleOAuth fn.    │
              │  signIn(provider,   │
              │  {callbackUrl})     │
              └──────────┬──────────┘
                         │
         ┌───────────────▼───────────────┐
         │  NextAuth: signIn Wrapper     │
         │  (/api/auth/signin/[provider])
         └───────────────┬───────────────┘
                         │
    ┌────────────────────▼─────────────────┐
    │  OAuth Provider Flow (Google/Discord)│
    │                                      │
    │  1. Redirect a OAuth Provider       │
    │  2. User autoriza app               │
    │  3. Provider envía code             │
    │  4. Backend intercambia code→token  │
    └────────────────────┬─────────────────┘
                         │
    ┌────────────────────▼──────────────────┐
    │  NextAuth Callback                    │
    │  /api/auth/callback/[provider]        │
    │  (Automático, configurado en auth.ts) │
    └────────────────────┬──────────────────┘
                         │
    ┌────────────────────▼──────────────────┐
    │  1. Si user NO existe:                │
    │     - Crear user en DB                │
    │     - Crear Account (relación OAuth)  │
    │     - Crear Session                   │
    │                                       │
    │  2. Si user EXISTE:                   │
    │     - Linkear Account (si no existe)  │
    │     - Crear Session                   │
    └────────────────────┬──────────────────┘
                         │
    ┌────────────────────▼──────────────────┐
    │  Redirect a callbackUrl (default: /) │
    │  + Cookie Session                    │
    └──────────────────────────────────────┘
```

---

## Flujos de Gestión de Inventario

### Listar Inventarios del Usuario

```
┌────────────────────────────────────────────┐
│  GET /inventory (Dashboard Page)          │
│  Usuario autenticado                       │
└────────────────┬─────────────────────────┘
                 │
       ┌─────────▼──────────┐
       │  InventoriesPage   │
       │  .tsx component    │
       └─────────┬──────────┘
                 │
       ┌─────────▼──────────────────────┐
       │  useQuery Hook:                │
       │  api.inventory.getAll()        │
       │  (React Query)                 │
       └─────────┬──────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  tRPC Call → /api/trpc/           │
       │  [trpc].?batch=...                │
       │  (client/server communication)    │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  protectedProcedure (/route.ts)    │
       │  Verifica autenticación            │
       │  ctx.session.user.id               │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  inventoryRouter.getAll            │
       │  → inventoryService.getAll(userId) │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  DB Query:                         │
       │  Inventory.findMany({              │
       │    where: { userId }               │
       │  })                                │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  Retornar Array de Inventarios     │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  React Query caché resultado       │
       │  Actualizar UI con lista           │
       └──────────────────────────────────┘
```

### Crear Nuevo Inventario

```
┌────────────────────────────────────────────┐
│  Usuario hace click en "Crear Inventario" │
│  Modal abre en InventoriesPage             │
└────────────────┬───────────────────────────┘
                 │
       ┌─────────▼──────────┐
       │  Form Modal        │
       │  - Nombre          │
       │  - Descripción     │
       └─────────┬──────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  onSubmit                          │
       │  - Validar campos                  │
       │  - Llamar tRPC mutate              │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  useMutation Hook:                 │
       │  api.inventory.create()            │
       │  Input: { name, description? }     │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  tRPC POST Request                 │
       │  (client ↔ server)                 │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  protectedProcedure validateInput  │
       │  Zod schema validate:              │
       │  - name: string (requerido)        │
       │  - description: string (opcional)  │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  inventoryService.create()         │
       │  Input: { userId, name,            │
       │           description }            │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  DB: Inventory.create({            │
       │    name,                           │
       │    description,                    │
       │    userId: ctx.session.user.id,    │
       │    createdAt: now()                │
       │  })                                │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  Retornar Inventario creado        │
       │  (con ID generado)                 │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  onSuccess callback:               │
       │  - Invalidar caché (getAll)        │
       │  - Cerrar modal                    │
       │  - Mostrar toast                   │
       │  - Redirigir a /inventory/[id]     │
       └──────────────────────────────────┘
```

### Ver Detalle de Inventario

```
┌────────────────────────────────────────────┐
│  GET /inventory/[id] (InventoryPage)      │
│  Usuario hace click en inventario          │
└────────────────┬───────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  [id]/page.tsx                     │
       │  - Leer params: { id }             │
       │  - Renderizar InventoryPage comp.  │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  InventoryPage.tsx (componente)    │
       │  → useQuery(inventory.getById)     │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  tRPC Request → Backend            │
       │  Input: { id: "123abc" }           │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  inventoryService.getById()        │
       │  - Validar userId                  │
       │  - Query DB:                       │
       │    Inventory.findFirst({           │
       │      where: {                      │
       │        id,                         │
       │        userId                      │
       │      },                            │
       │      include: { items }            │
       │    })                              │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  if (!inventory) → 404             │
       │  else → retornar con items         │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  UI muestra:                       │
       │  - Nombre del inventario           │
       │  - Lista de items                  │
       │  - Botón "Hacer Público"           │
       │  - Botón "Agregar Item"            │
       │  - Botón "Agregar Área"            │
       └──────────────────────────────────┘
```

---

## Flujos de Items

### Crear Item en Inventario

```
┌──────────────────────────────────────────────┐
│  Usuario en /inventory/[id]                 │
│  Click: "Agregar Item"                       │
└────────────────┬──────────────────────────┐
                 │
       ┌─────────▼──────────┐
       │  Modal Form abre   │
       │  (ItemPublic.tsx)  │
       └─────────┬──────────┘
                 │
       ┌─────────▼────────────────────────┐
       │  Formulario:                     │
       │  - Nombre (requerido)            │
       │  - Descripción (opcional)        │
       │  - Cantidad (opcional, def: 1)   │
       │  - Área (select, opcional)       │
       │  - URL Manual (opcional)         │
       │  - Precio (opcional)             │
       └─────────┬────────────────────────┘
                 │
       ┌─────────▼────────────────────────┐
       │  onSubmit:                       │
       │  - Validar datos                 │
       │  - api.item.create({...})        │
       └─────────┬────────────────────────┘
                 │
       ┌─────────▼────────────────────────┐
       │  tRPC Mutation                   │
       │  Input Schema (Zod):             │
       │  {                               │
       │    inventoryId: string,          │
       │    name: string,                 │
       │    description?: string,         │
       │    amount?: number,              │
       │    areaId?: string,              │
       │    manualUrl?: string,           │
       │    price?: float                 │
       │  }                               │
       └─────────┬────────────────────────┘
                 │
       ┌─────────▼────────────────────────┐
       │  itemService.create()            │
       │  1. Validar ownership (userId)   │
       │  2. Validate inventory existe    │
       └─────────┬────────────────────────┘
                 │
       ┌─────────▼────────────────────────┐
       │  DB: Item.create({               │
       │    name,                         │
       │    description,                  │
       │    amount,                       │
       │    areaId,                       │
       │    manualUrl,                    │
       │    price,                        │
       │    inventoryId,                  │
       │    createdAt: now()              │
       │  })                              │
       └─────────┬────────────────────────┘
                 │
       ┌─────────▼────────────────────────┐
       │  onSuccess:                      │
       │  - Cerrar modal                  │
       │  - Invalidar caché getByInventory│
       │  - Toast: "Item creado"          │
       │  - Item aparece en lista         │
       └──────────────────────────────────┘
```

### Eliminar Item

```
┌──────────────────────────────────────────────┐
│  Usuario en /inventory/[id]                 │
│  Click: Botón "Eliminar" en item           │
└────────────────┬──────────────────────────┐
                 │
       ┌─────────▼──────────────────────────┐
       │  Confirmar eliminación            │
       │  (Modal: "¿Estás seguro?")        │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  api.item.delete({ itemId })      │
       │  (tRPC Mutation)                  │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  protectedProcedure                │
       │  Input: { itemId: string }        │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  itemService.delete()             │
       │  1. Validar userId               │
       │  2. Check item pertenece a user   │
       │  3. Validar sin préstamos activos │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  DB: Item.delete({ id: itemId })  │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  onSuccess:                       │
       │  - Invalidar caché                │
       │  - Toast: "Item eliminado"        │
       │  - Refetch lista items            │
       └──────────────────────────────────┘
```

---

## Flujos de Préstamos

### Crear Préstamo (Marcar como Prestado)

```
┌───────────────────────────────────────────────┐
│  Usuario en /inventory/[id]                  │
│  Ve item disponible                           │
│  Click: "Prestar" (o loan button)            │
└────────────────┬────────────────────────────┐
                 │
       ┌─────────▼──────────────────┐
       │  Modal Form abre           │
       │  Formulario Préstamo:      │
       │  - Nombre quien pide       │
       │  - Contacto (opcional)     │
       │  - Notas (opcional)        │
       └─────────┬──────────────────┘
                 │
       ┌─────────▼──────────────────┐
       │  onSubmit:                 │
       │  api.loan.create({         │
       │    itemId,                 │
       │    borrowerName,           │
       │    borrowerContact?,       │
       │    notes?                  │
       │  })                        │
       └─────────┬──────────────────┘
                 │
       ┌─────────▼──────────────────────────────┐
       │  tRPC Mutation Backend               │
       │  loanRouter.create()                 │
       │  Input schema (Zod):                 │
       │  {                                   │
       │    itemId: string,                   │
       │    borrowerName: string,             │
       │    borrowerContact?: string,         │
       │    notes?: string                    │
       │  }                                   │
       └─────────┬──────────────────────────────┘
                 │
       ┌─────────▼──────────────────────────────┐
       │  loanService.create()                │
       │  1. Validar item existe y es user   │
       │  2. Validar sin préstamo activo     │
       │  3. Validate input                  │
       └─────────┬──────────────────────────────┘
                 │
       ┌─────────▼──────────────────────────────┐
       │  DB: Loan.create({                  │
       │    itemId,                          │
       │    borrowerName,                    │
       │    borrowerContact,                 │
       │    notes,                           │
       │    startDate: now(),                │
       │    returned: false                  │
       │  })                                 │
       └─────────┬──────────────────────────────┘
                 │
       ┌─────────▼──────────────────────────────┐
       │  onSuccess:                         │
       │  - Cerrar modal                     │
       │  - Invalidar item cache             │
       │  - Item ahora muestra "Prestado"    │
       │  - Mostrar botón "Devolver"         │
       │  - Toast: "Préstamo registrado"     │
       └─────────────────────────────────────────┘
```

### Devolver Item (Marcar Préstamo como Completo)

```
┌───────────────────────────────────────────────┐
│  Usuario en /inventory/[id]                  │
│  Ve item con estado "Prestado"               │
│  Quién pide: Juan Pérez                      │
│  Click: "Devolver"                           │
└────────────────┬────────────────────────────┐
                 │
       ┌─────────▼────────────────────┐
       │  Confirmar devolución:      │
       │  "¿Marcar como devuelto?"   │
       └─────────┬────────────────────┘
                 │
       ┌─────────▼────────────────────────────┐
       │  api.loan.returnItem({              │
       │    loanId: loan.id                  │
       │  })                                 │
       └─────────┬────────────────────────────┘
                 │
       ┌─────────▼────────────────────────────┐
       │  tRPC Mutation Backend              │
       │  loanRouter.returnItem()            │
       │  Input: { loanId: string }          │
       └─────────┬────────────────────────────┘
                 │
       ┌─────────▼────────────────────────────┐
       │  loanService.returnItem()           │
       │  1. Validar loan existe y es user   │
       │  2. Validar loan.returned === false │
       │  3. Query DB para get loan + item   │
       └─────────┬────────────────────────────┘
                 │
       ┌─────────▼────────────────────────────┐
       │  DB: Loan.update({                  │
       │    where: { id: loanId },           │
       │    data: {                          │
       │      returned: true,                │
       │      endDate: now()                 │
       │    }                                │
       │  })                                 │
       └─────────┬────────────────────────────┘
                 │
       ┌─────────▼────────────────────────────┐
       │  onSuccess:                         │
       │  - Invalidar cache                  │
       │  - Item vuelve a "Disponible"       │
       │  - Desaparece info del préstamo    │
       │  - Botón "Prestar" vuelve a aparecer│
       │  - Toast: "Item devuelto"           │
       └──────────────────────────────────────┘
```

### Historial de Préstamos (Visualización)

```
┌─────────────────────────────────────────┐
│  ItemDetail Card                        │
│  - Item: Taladro                       │
│  - Cantidad: 2                          │
│  - Status: Disponible                   │
│                                         │
│  PRÉSTAMOS ACTIVOS:                    │
│  ┌─────────────────────────────────┐  │
│  │ Juan Pérez (555-1234)           │  │
│  │ Desde: 30/03/26 10:00          │  │
│  │ Notas: Traer el viernes         │  │
│  │ [Botón: Marcar Devuelto]       │  │
│  └─────────────────────────────────┘  │
│                                         │
│  PRÉSTAMOS ANTERIORES:                 │
│  (en historial)                         │
│  - María García: 15/03-18/03          │
│  - Carlos López: 10/03-12/03          │
└─────────────────────────────────────────┘
```

---

## Flujos de Sharing Público

### Habilitar Acceso Público

```
┌─────────────────────────────────────────┐
│  Usuario en /inventory/[id]             │
│  Click: "Compartir" o "Hacer Público"  │
└────────────────┬──────────────────────┐
                 │
       ┌─────────▼────────────────────────┐
       │  api.inventory.                 │
       │  enablePublicAccess({           │
       │    id: inventoryId              │
       │  })                             │
       └─────────┬────────────────────────┘
                 │
       ┌─────────▼────────────────────────┐
       │  tRPC Mutation Backend          │
       │  inventoryRouter.               │
       │  enablePublicAccess()           │
       │  Input: { id: string }          │
       └─────────┬────────────────────────┘
                 │
       ┌─────────▼────────────────────────┐
       │  inventoryService.              │
       │  enablePublicAccess()           │
       │  1. Validate inventory + user   │
       │  2. Generate UUID token         │
       │  3. Ensure token uniqueness     │
       └─────────┬────────────────────────┘
                 │
       ┌─────────▼────────────────────────┐
       │  DB: Inventory.update({         │
       │    where: { id },               │
       │    data: {                      │
       │      publicToken: randomUUID()  │
       │    }                            │
       │  })                             │
       └─────────┬────────────────────────┘
                 │
       ┌─────────▼────────────────────────┐
       │  onSuccess:                     │
       │  - Toast: "Compartido!"         │
       │  - Mostrar public link:         │
       │    /public/inventory/[token]    │
       │  - Mostrar QR code              │
       │  - Copy to clipboard button     │
       └─────────────────────────────────┘
```

### Ver Inventario Público (Sin Autenticación)

```
┌─────────────────────────────────────────────┐
│  Usuario (NO autenticado)                   │
│  Escanea QR o accede:                       │
│  /public/inventory/[publicToken]            │
└────────────────┬─────────────────────────┬─┘
                 │
       ┌─────────▼──────────────────────────┐
       │  GET /public/inventory/[token]    │
       │  (página pública)                 │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼──────────────────────────┐
       │  [token]/page.tsx                 │
       │  → ItemPublic.tsx component       │
       │  → useEffect fetch public data    │
       └─────────┬──────────────────────────┘
                 │
       ┌─────────▼───────────────────────────┐
       │  GET /api/public/inventory/[token]  │
       │  (API endpoint sin autenticación)   │
       │  SIN tRPC (es ruta API simple)       │
       └─────────┬───────────────────────────┘
                 │
       ┌─────────▼───────────────────────────┐
       │  Backend: route.ts                  │
       │  1. Extraer token de params        │
       │  2. DB.inventory.findFirst({       │
       │       where: { publicToken: token }│
       │     })                              │
       │  3. include: {                      │
       │       areas: true,                  │
       │       items: {                      │
       │         include: {                  │
       │           loans (returned: false)   │
       │         }                           │
       │       }                             │
       │     }                               │
       └─────────┬───────────────────────────┘
                 │
       ┌─────────▼────────────────────────┐
       │  if (!inventory)                 │
       │    → 404: "Not found"            │
       │  else                            │
       │    → JSON response:              │
       │  {                               │
       │    id,                           │
       │    name,                         │
       │    areas: [{id, name}, ...],    │
       │    items: [{                     │
       │      id, name, description,      │
       │      amount, manualUrl, price,   │
       │      areaId,                     │
       │      loans: [{                   │
       │        id, borrowerName,         │
       │        borrowerContact,          │
       │        startDate, returned, notes│
       │      }]                          │
       │    }, ...]                       │
       │  }                               │
       └─────────┬────────────────────────┘
                 │
       ┌─────────▼────────────────────────┐
       │  React renders:                  │
       │  - Nombre inventario            │
       │  - Listado de items             │
       │  - Para c/ item:                │
       │    - Disponibilidad             │
       │    - Quién lo tiene prestado    │
       │    - Cuándo lo tomó             │
       │  - Organizados por área         │
       └────────────────────────────────┘
```

---

## Flujos de Datos (Comunicación Cliente-Servidor)

### Arquitectura de Comunicación

```
┌─────────────────────────────────────┐
│      CLIENTE (React/Browser)        │
├─────────────────────────────────────┤
│  Components (Pages/Componentes)    │
│          ↓↑                          │
│  React Query Hooks                 │
│  - useQuery                        │
│  - useMutation                     │
│          ↓↑                          │
│  tRPC Client                       │
│  (@trpc/react-query)              │
│          ↓↑                          │
│  HTTP/JSON over JSON              │
│  /api/trpc/[trpc]?batch=...       │
│          ↓↑                          │
├─────────────────────────────────────┤
│        SERVIDOR (Node.js)          │
│          ↓↑                          │
│  Next.js API Route                │
│  /api/trpc/[trpc]/route.ts        │
│          ↓↑                          │
│  tRPC Router Procedimiento        │
│  (procedimiento matcheado)        │
│          ↓↑                          │
│  Middleware:                       │
│  - Input Validation (Zod)         │
│  - Auth Check                     │
│  - Context enhancement            │
│          ↓↑                          │
│  Service Layer                     │
│  (Lógica de negocio)              │
│          ↓↑                          │
│  Prisma Client                     │
│  (Database Query Builder)          │
│          ↓↑                          │
│  PostgreSQL Database               │
└─────────────────────────────────────┘
```

### Ejemplo: Query (GET)

```
CLIENTE:
┌─────────────────────────────────┐
│ useQuery Hook                   │
│ api.inventory.getAll()          │
└────────────┬────────────────────┘
             │
    ┌────────▼────────────┐
    │ React Query Cached? │
    └────┬───────┬────────┘
         │ NO    │ YES
    ┌────▼────┐  └─→ Return cached data
    │          │
    │ HTTP    │
    │ GET     │
    │ /api/   │
    │ trpc    │
    └────┬────┘

SERVIDOR:
┌────────────────────────────────┐
│ tRPC Route Handler             │
│ inventoryRouter.getAll         │
├────────────────────────────────┤
│ 1. Extract context (session)  │
│ 2. Validate input (none)      │
│ 3. inventoryService.getAll()  │
│ 4. db.inventory.findMany()    │
│ 5. Return [] or error         │
└────────────┬───────────────────┘
             │
    ┌────────▼──────────┐
    │ Serialize + JSON  │
    │ Response          │
    └────────┬──────────┘
             │
CLIENTE:
    ┌────────▼──────────┐
    │ Parse JSON        │
    │ Update cache      │
    │ Trigger re-render │
    └───────────────────┘
```

### Ejemplo: Mutation (POST/PUT)

```
CLIENTE:
┌─────────────────────────────────┐
│ useMutation Hook                │
│ api.inventory.create()          │
│ .mutate({ name: "Mi Inv" })   │
└────────────┬────────────────────┘
             │
    ┌────────▼────────────┐
    │ HTTP POST           │
    │ /api/trpc/[trpc]   │
    │ body: {             │
    │   name: "Mi Inv"    │
    │ }                   │
    └────────┬────────────┘

SERVIDOR:
┌────────────────────────────────┐
│ protectedProcedure             │
│ Check session exists           │
└────────┬───────────────────────┘
         │
┌────────▼───────────────────────┐
│ Input Validation (Zod)         │
│ {                              │
│   name: z.string(),            │
│   description: z.string().opt()│
│ }                              │
└────────┬───────────────────────┘
         │
┌────────▼───────────────────────┐
│ inventoryService.create()      │
│ Input: {                       │
│   userId, name, description    │
│ }                              │
└────────┬───────────────────────┘
         │
┌────────▼───────────────────────┐
│ db.inventory.create({          │
│   name, description, userId    │
│ })                             │
└────────┬───────────────────────┘
         │
    ┌────▼──────────────────┐
    │ if (error)           │
    │ → throw TRPCError()  │
    │ else                 │
    │ → return Inventory   │
    └────┬──────────────────┘

CLIENTE:
    ┌────▼──────────────────┐
    │ onSuccess callback    │
    │ - Invalidar cache     │
    │ - Refetch getAll      │
    │ - Toast               │
    │ - Redirect            │
    └──────────────────────┘
```

### Flujo de Error

```
┌──────────────────────────────┐
│ Algo sale mal en server      │
└──────────────┬───────────────┘
               │
       ┌───────▼───────────┐
       │ throw TRPCError   │
       │ {                 │
       │   code,           │
       │   message,        │
       │   cause (opt)     │
       │ }                 │
       └───────┬───────────┘
               │
       ┌───────▼──────────────────┐
       │ tRPC serializa error     │
       │ HTTP 400/500             │
       │ JSON Response:           │
       │ {                        │
       │   error: {               │
       │     code: "NOT_FOUND",   │
       │     message: "..."       │
       │   }                      │
       │ }                        │
       └───────┬──────────────────┘
               │
       ┌───────▼──────────────────┐
       │ CLIENTE recibe error     │
       │ onError callback:        │
       │ - Mostrar error toast    │
       │ - Log error              │
       │ - No refetch (opcional)  │
       │ - Redirigir si 401/403   │
       └───────────────────────┘
```

---

## Diagrama de Componentes

### Estructura de Páginas

```
/                              (Root Layout)
├── /auth/
│   ├── /signin                (SignInPage)
│   ├── /register              (RegisterPage)
│   └── /error                 (ErrorPage)
│
├── /(dashboard)/              (Protected Layout)
│   ├── /inventory             (InventoriesPage - lista)
│   └── /inventory/[id]        (InventoryPage - detalle)
│
└── /public/
    └── /inventory/[token]     (ItemPublic - sin auth)
```

### Árbol de Componentes

```
Layout.tsx (Root)
├── Providers (tRPC, React Query, NextAuth)
│   │
│   ├── /auth/signin → SignInPage.tsx
│   │   ├── OAuth Buttons (Google, Discord)
│   │   ├── Credentials Form
│   │   └── Magic Link Option
│   │
│   ├── /auth/register → RegisterPage.tsx
│   │   ├── Name Input
│   │   ├── Email Input
│   │   ├── Password Inputs (2x)
│   │   └── OAuth Buttons
│   │
│   ├── /(dashboard)/layout.tsx
│   │   │
│   │   ├── Sidebar/Navbar
│   │   ├── /inventory → InventoriesPage.tsx
│   │   │   ├── Inventory Grid/List
│   │   │   ├── Create Modal
│   │   │   └── Search Filter
│   │   │
│   │   └── /inventory/[id] → InventoryPage.tsx
│   │       ├── Header (nombre, opciones)
│   │       ├── ItemList
│   │       │   └── ItemCard (repite)
│   │       │       ├── Item Info
│   │       │       ├── Loan Status
│   │       │       └── Actions (Prestar, Editar, Eliminar)
│   │       ├── AreaSelector
│   │       └── Buttons (Add Item, Add Area, Share)
│   │
│   └── /public/inventory/[token] → ItemPublic.tsx
│       ├── Inventory Header
│       ├── ItemCard (Read-only)
│       │   ├── Item Info
│       │   └── Loan Info
│       └── QR Code Display
```

### Componentes Modales

```
ModalWrapper (Base)
├── CreateInventoryModal
├── CreateItemModal
├── CreateLoanModal
├── CreateAreaModal
├── ShareInventoryModal (con QR)
└── ConfirmDeleteModal
```

### Flujo de Data en Componentes

```
InventoryPage.tsx
├── useQuery(inventory.getById)
│   └── [items data]
│
├── ItemCard (map por cada item)
│   ├── State: item, loanInfo
│   ├── Buttons:
│   │   ├── "Prestar" 
│   │   │   └── Modal Form → useMutation(loan.create)
│   │   │
│   │   ├── "Devolver"
│   │   │   └── useMutation(loan.returnItem)
│   │   │
│   │   └── "Eliminar"
│   │       └── useM
```

---

**Diagrama actualizado:** 30 de Marzo de 2026
