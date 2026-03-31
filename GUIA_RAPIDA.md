# 🚀 Guía Rápida - Inventario App

Resumen ejecutivo y guía de inicio rápido para desarrolladores.

---

## 📌 Resumen de 30 segundos

**Inventario** es una aplicación fullstack para:
- Gestionar inventarios compartidos entre usuarios
- Rastrear préstamos de items
- Compartir inventarios públicamente vía QR
- Acceder sin autenticación a inventarios compartidos

**Stack:** Next.js 15 + tRPC + Prisma + PostgreSQL + NextAuth

---

## 🎯 Funcionalidades Principales

| Función | Acceso | Descripción |
|---------|--------|------------|
| **Gestión de Inventarios** | Autenticado | Crear, editar, listar inventarios personales |
| **Gestión de Items** | Autenticado | Agregar items, organizados por áreas |
| **Sistema de Préstamos** | Autenticado | Registrar quién toma prestado qué |
| **Compartir Público** | Token | Acceso público con URL/QR |
| **API Pública** | Abierta | Endpoint REST sin autenticación |
| **OAuth** | Abierta | Google y Discord login |

---

## 🗂️ Estructura de Carpetas (Lo Importante)

```
src/
├── app/                    ← Frontend (páginas, componentes)
│   ├── auth/              ← Login/Register
│   ├── (dashboard)/       ← Rutas protegidas (solo autenticados)
│   └── public/            ← Páginas públicas
│
└── server/                 ← Backend (lógica, DB)
    ├── api/
    │   ├── routers/       ← tRPC routers (5 archivos)
    │   └── trpc.ts        ← Configuración tRPC
    └── services/          ← Lógica de negocio
```

**5 Routers tRPC:**
1. `auth.ts` - Registro y autenticación
2. `inventory.ts` - Gestión de inventarios
3. `item.ts` - Gestión de items
4. `loan.ts` - Sistema de préstamos
5. `area.ts` - Áreas/secciones

---

## 🔐 Modelos de Base de Datos (Simple)

```
User ─────┐
          │ (uno a muchos)
    ┌─────▼──────┐
    Inventory    │
    ├─ Items ────┘
    └─ Areas

Item  ──┐
        │ (uno a muchos)
        └─ Loan
```

**Principales:**
- `User` - Usuarios registrados
- `Inventory` - Inventarios (c/user puede tener varios)
- `Item` - Items en inventario
- `Area` - Secciones/categorías
- `Loan` - Registro de préstamos

---

## 🚀 Primeros 5 Pasos

### 1. **Clonar y Instalar**
```bash
cd inventory
npm install
```

### 2. **Configurar Variables de Entorno**
```bash
# Copiar .env.example → .env
# Editar con:
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
# + OAuth credentials (Google, Discord)
```

### 3. **Inicializar Base de Datos**
```bash
npm run db:migrate
npm run db:generate
```

### 4. **Iniciar Servidor de Desarrollo**
```bash
npm run dev
# Abre http://localhost:3000
```

### 5. **Crear Cuenta y Jugar**
- Ir a `/auth/register` o `/auth/signin`
- Crear inventario
- Agregar items
- Compartir (generar token público)
- Ver en `/public/inventory/[token]`

---

## 🔄 Flujos Principales (Diagrama)

### Autenticación
```
Register/SignIn
    ↓
NextAuth + Database
    ↓
Session Cookie
    ↓
Protected Pages
```

### Manejo de Inventario
```
Dashboard (/inventory)
    ↓ click inventario
Detail (/inventory/[id])
    ├─ Ver items
    ├─ Crear item
    ├─ Registrar préstamo
    └─ Compartir (token)
```

### Compartir Público
```
"Hacer Público"
    ↓ genera UUID token
Guardar en DB
    ↓
Mostrar QR + Link
    ↓
/public/inventory/[token]
(sin login)
```

---

## 💻 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Hot-reload local

# Base de datos
npm run db:migrate      # Aplicar migraciones
npm run db:push         # Sync schema
npm run db:studio       # GUI Prisma Studio

# Calidad
npm run lint            # ESLint check
npm run check           # ESLint + TypeScript

# Build
npm run build           # Producción
npm run preview         # Test build

# Limpieza
npm run format:write    # Auto-format código
npm run lint:fix        # Arreglar lint errors
```

---

## 📡 API Endpoints

### Autenticados (tRPC)
```
POST /api/trpc/inventory.create
POST /api/trpc/inventory.getAll
POST /api/trpc/item.create
POST /api/trpc/loan.create
POST /api/trpc/loan.returnItem
... (más en documentación completa)
```

### Públicos (REST)
```
GET /api/public/inventory/[token]
    ↓
JSON con: inventory, areas, items, loans
```

### Auth (NextAuth)
```
GET  /api/auth/signin
POST /api/auth/callback/credentials
POST /api/auth/callback/google
POST /api/auth/callback/discord
POST /api/auth/signout
```

---

## 🎨 UI/UX Quick Reference

### Colores Principales
- **Fondo:** `#0c0c10` (oscuro)
- **Acento:** `amber-500` y `orange-500` (gradiente)
- **Bordes:** `white/10` (sutil)
- **Error:** `red-500`

### Componentes Base
- Botones → estilos consistentes
- Inputs → borders, focus states
- Modales → animación framer-motion
- Cards → sombra y border-radius

---

## 🐛 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| "Inventory not found" | Verificar userId coincide |
| "Item already loaned" | Devolver item antes |
| Error BD | Revisar DATABASE_URL |
| 401 Unauthorized | Revisar sesión/cookies |
| tRPC error | Ver logs en console |

---

## 📝 Archivos de Configuración

**Importante editar:**

1. **`.env`** - Variables de entorno
2. **`prisma/schema.prisma`** - Modelo de datos
3. **`next.config.js`** - Config Next.js
4. **`tailwind.config.ts`** - Estilos
5. **`tsconfig.json`** - TypeScript

**No editar (auto-generado):**
- `generated/prisma/` - Prisma Client
- `.next/` - Build
- `node_modules/` - Dependencias

---

## 🔑 Conceptos Clave

### tRPC
- RPC type-safe entre cliente y servidor
- Validación con Zod
- Queries (GET-like) y Mutations (POST-like)
- Protegidas con sesión NextAuth

### Prisma
- ORM para PostgreSQL
- Define schema en `.prisma`
- Auto-genera tipos TypeScript
- Migraciones versionadas

### NextAuth
- Autenticación en Next.js
- Soporta Credentials, OAuth, Email
- Session storage en BD
- Cookies HttpOnly

### React Query
- Gestión de estado servidor
- Caché automático
- Refetch/Invalidate
- Loading/Error states

---

## 📚 Documentación Extendida

Este README es un resumen. Para más detalles:

- **`README_COMPLETO.md`** - Documentación completa
- **`FLUJOS_DETALLADOS.md`** - Diagramas de flujos
- **`API_PUBLICA.md`** - API REST documentada

---

## 🎓 Aprendizaje

Este proyecto enseña:

- ✅ Fullstack con Next.js
- ✅ RPC type-safe (tRPC)
- ✅ Autenticación (NextAuth)
- ✅ ORM (Prisma)
- ✅ Componentes React
- ✅ Validación (Zod)
- ✅ Diseño responsivo (Tailwind)
- ✅ Seguridad y autorización

---

## 🤝 Estructura de Team

### Roles:
- **Frontend Dev** → Editar componentes en `src/app/`
- **Backend Dev** → Editar routers/services en `src/server/`
- **DevOps** → Gestionar DB y deploy
- **QA** → Testear flujos

Todos usan **Git branches** para cambios.

---

## 📊 Performance Tips

1. **Use React Query cache** - No re-fetch innecesario
2. **Lazy load components** - `dynamic()` de Next.js
3. **Optimize images** - Use `next/image`
4. **DB queries** - Use `include` selectivamente
5. **Build size** - Check con `npm run build`

---

## 🔒 Seguridad Checklist

- ✅ Validar userId en cada operación
- ✅ Use `protectedProcedure` para rutas privadas
- ✅ Hash passwords con bcryptjs
- ✅ CORS configurado
- ✅ SQL injection protected (Prisma)
- ✅ XSS protected (React auto-escapes)
- ✅ CSRF protection (NextAuth)

---

## 🚀 Deployment

### Vercel (Recomendado)
```bash
# Push a GitHub
git push origin main

# Vercel auto-deploya
# + Setup DB (PostgreSQL)
# + Config env vars
```

### Docker
```bash
docker build -t inventario .
docker run -p 3000:3000 inventario
```

### Manual
```bash
npm run build
npm run start
# En puerto 3000
```

---

## 📞 Debugging

### Logs
```bash
# Ver tRPC calls
npm run dev   # console shows requests

# Ver DB queries
npm run db:studio   # GUI
```

### Browser DevTools
- Network tab → ver tRPC requests
- Application tab → cookies/session
- Console → logs y errores

### VSCode Extensions (Recomendadas)
- ESLint
- Prettier
- Prisma
- Thunder Client (API testing)

---

## 📅 Roadmap (Próximas Mejoras)

- [ ] Historial completo de préstamos
- [ ] Reportes CSV
- [ ] Notificaciones por email
- [ ] App móvil
- [ ] Multi-usuario por inventario
- [ ] Historial de cambios
- [ ] Búsqueda full-text
- [ ] Dark mode selector

---

## 📌 Notas Importantes

1. **Base de datos:** Usa PostgreSQL (no SQLite)
2. **Autenticación:** NextAuth v5 beta
3. **Tipos:** Todo está tipado (TypeScript strict)
4. **Estilos:** Tailwind CSS v4
5. **ORM:** Prisma v6

---

## 🎉 ¡Listo para Empezar!

```bash
# 1. Clone
git clone <repo> && cd inventory

# 2. Install
npm install

# 3. Env
cp .env.example .env
# editar .env

# 4. DB
npm run db:migrate

# 5. Dev
npm run dev

# ¡Abierto en http://localhost:3000!
```

---

**Última actualización:** 30 de Marzo de 2026

Para preguntas, revisar documentación extendida o contactar al equipo.
