# 🌐 API Pública - Documentación Completa

Documentación exhaustiva de la API pública para acceder a inventarios compartidos sin autenticación.

---

## 📋 Descripción General

La API Pública permite acceder a inventarios que han sido compartidos por sus propietarios mediante un token único. Es una API **REST** simple (no requiere tRPC) que retorna datos en formato JSON.

**Punto de entrada:**
```
GET /api/public/inventory/[token]
```

**Autenticación:** ❌ No requerida
**Tipo de contenido:** `application/json`

---

## 🔑 Endpoint Principal

### GET /api/public/inventory/[token]

Recupera un inventario público junto con sus items, áreas y préstamos activos.

#### Parámetros

| Parámetro | Tipo   | Ubicación | Requerido | Descripción |
|-----------|--------|-----------|-----------|-------------|
| `token`   | string | URL Path  | ✅ Sí    | Token público UUID único del inventario |

#### Ejemplos de URL

```
# Ejemplo 1
https://inventario.app/api/public/inventory/550e8400-e29b-41d4-a716-446655440000

# Ejemplo 2
https://localhost:3000/api/public/inventory/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

---

## 📨 Respuestas

### ✅ Respuesta Exitosa (200 OK)

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "clb2p3q4r5s6t7u8v9w0x1y2z",
  "name": "Inventario de Herramientas - Taller",
  "areas": [
    {
      "id": "area_123_abc",
      "name": "Herramientas Manuales"
    },
    {
      "id": "area_456_def",
      "name": "Herramientas Eléctricas"
    },
    {
      "id": "area_789_ghi",
      "name": "Seguridad y Protección"
    }
  ],
  "items": [
    {
      "id": "item_001",
      "name": "Taladro DeWalt 800W",
      "description": "Taladro percutor profesional con batería de litio",
      "amount": 2,
      "manualUrl": "https://example.com/manual-dewalt-800.pdf",
      "price": 150.50,
      "areaId": "area_456_def",
      "createdAt": "2026-03-15T10:30:00Z",
      "loans": [
        {
          "id": "loan_001",
          "borrowerName": "Juan Pérez",
          "borrowerContact": "555-1234-5678",
          "startDate": "2026-03-28T14:00:00Z",
          "endDate": null,
          "returned": false,
          "notes": "Debo entregarlo el viernes por la tarde"
        }
      ]
    },
    {
      "id": "item_002",
      "name": "Sierra Circular Bosch",
      "description": "Sierra circular 7 pulgadas 1400W",
      "amount": 1,
      "manualUrl": null,
      "price": 85.00,
      "areaId": "area_456_def",
      "createdAt": "2026-02-20T09:15:00Z",
      "loans": []
    },
    {
      "id": "item_003",
      "name": "Martillo de Acero",
      "description": "Martillo de 500g con mango de fibra",
      "amount": 5,
      "manualUrl": null,
      "price": 12.50,
      "areaId": "area_123_abc",
      "createdAt": "2026-01-10T16:45:00Z",
      "loans": []
    },
    {
      "id": "item_004",
      "name": "Casco de Seguridad",
      "description": "Casco amarillo con arnés ajustable",
      "amount": 10,
      "manualUrl": null,
      "price": 25.00,
      "areaId": "area_789_ghi",
      "createdAt": "2026-03-01T11:20:00Z",
      "loans": []
    }
  ]
}
```

#### Descripción de Campos

**Objeto Inventory (raíz)**

| Campo    | Tipo   | Descripción |
|----------|--------|-------------|
| `id`     | string | ID único del inventario (CUID) |
| `name`   | string | Nombre del inventario |
| `areas`  | array  | Array de áreas/secciones del inventario |
| `items`  | array  | Array de items con sus datos |

**Objeto Area**

| Campo  | Tipo   | Descripción |
|--------|--------|-------------|
| `id`   | string | ID único del área |
| `name` | string | Nombre del área/sección |

**Objeto Item**

| Campo       | Tipo    | Descripción |
|-------------|---------|-------------|
| `id`        | string  | ID único del item |
| `name`      | string  | Nombre del item |
| `description` | string\|null | Descripción detallada |
| `amount`    | number  | Cantidad disponible |
| `manualUrl` | string\|null | URL al manual/documentación |
| `price`     | number  | Precio unitario |
| `areaId`    | string  | ID del área a que pertenece |
| `createdAt` | ISO 8601 | Fecha de creación |
| `loans`     | array   | Array de préstamos activos |

**Objeto Loan (Préstamo)**

| Campo           | Tipo    | Descripción |
|-----------------|---------|-------------|
| `id`            | string  | ID único del préstamo |
| `borrowerName`  | string  | Nombre de quien toma prestado |
| `borrowerContact` | string\|null | Contacto (teléfono, email) |
| `startDate`     | ISO 8601 | Fecha y hora del préstamo |
| `endDate`       | ISO 8601\|null | Fecha de devolución (null si activo) |
| `returned`      | boolean | ¿Ha sido devuelto? |
| `notes`         | string\|null | Notas adicionales |

---

### ❌ Respuesta de Error (404 Not Found)

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Not found"
}
```

**Causas posibles:**
- Token inválido/inexistente
- Inventario no está compartido públicamente
- Token expirado o revocado

---

### ❌ Respuesta de Error (500 Internal Server Error)

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "error": "Internal server error"
}
```

**Causas posibles:**
- Error de conexión a base de datos
- Error en el servidor

---

## 📝 Ejemplos de Uso

### cURL

```bash
# Obtener inventario público
curl -X GET "https://inventario.app/api/public/inventory/550e8400-e29b-41d4-a716-446655440000" \
  -H "Accept: application/json"

# Con formato pretty-printed
curl -X GET "https://inventario.app/api/public/inventory/550e8400-e29b-41d4-a716-446655440000" \
  -H "Accept: application/json" | jq .
```

### JavaScript/Fetch

```javascript
// Función básica
async function getPublicInventory(token) {
  try {
    const response = await fetch(
      `/api/public/inventory/${token}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching inventory:", error);
    throw error;
  }
}

// Uso
const token = "550e8400-e29b-41d4-a716-446655440000";
const inventory = await getPublicInventory(token);
console.log(inventory.name);
console.log(inventory.items);
```

### JavaScript/Axios

```javascript
import axios from 'axios';

async function getPublicInventory(token) {
  try {
    const { data } = await axios.get(
      `/api/public/inventory/${token}`
    );
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error("Inventario no encontrado");
    } else {
      console.error("Error:", error.message);
    }
    throw error;
  }
}
```

### React Hook

```typescript
import { useEffect, useState } from 'react';

interface Inventory {
  id: string;
  name: string;
  areas: Area[];
  items: Item[];
}

export function usePublicInventory(token: string) {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(`/api/public/inventory/${token}`);
        
        if (!response.ok) {
          throw new Error('Inventario no encontrado');
        }
        
        const data = await response.json();
        setInventory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [token]);

  return { inventory, loading, error };
}

// Uso en componente
function InventoryViewer({ token }: { token: string }) {
  const { inventory, loading, error } = usePublicInventory(token);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!inventory) return <div>No encontrado</div>;

  return (
    <div>
      <h1>{inventory.name}</h1>
      {inventory.items.map(item => (
        <div key={item.id}>
          <h2>{item.name}</h2>
          <p>Disponible: {item.amount}</p>
          {item.loans.length > 0 && (
            <p>Prestado a: {item.loans[0].borrowerName}</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Python

```python
import requests
from typing import Optional, Dict, List

def get_public_inventory(token: str, base_url: str = "https://inventario.app") -> Optional[Dict]:
    """
    Obtiene un inventario público
    
    Args:
        token: Token UUID del inventario público
        base_url: URL base de la API
        
    Returns:
        Dict con datos del inventario o None si no existe
        
    Raises:
        requests.RequestException: Si hay error de conexión
    """
    url = f"{base_url}/api/public/inventory/{token}"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            print("Inventario no encontrado")
            return None
        raise
    except requests.RequestException as e:
        print(f"Error de conexión: {e}")
        raise

# Uso
if __name__ == "__main__":
    token = "550e8400-e29b-41d4-a716-446655440000"
    inventory = get_public_inventory(token)
    
    if inventory:
        print(f"Inventario: {inventory['name']}")
        print(f"Items disponibles: {len(inventory['items'])}")
        
        for item in inventory['items']:
            print(f"- {item['name']}: {item['amount']} unidades")
            if item['loans']:
                for loan in item['loans']:
                    print(f"  Prestado a: {loan['borrowerName']}")
```

### TypeScript/Vite

```typescript
// api/inventory.ts
interface PublicInventory {
  id: string;
  name: string;
  areas: { id: string; name: string }[];
  items: {
    id: string;
    name: string;
    description?: string;
    amount: number;
    manualUrl?: string;
    price?: number;
    areaId?: string;
    createdAt: string;
    loans: {
      id: string;
      borrowerName: string;
      borrowerContact?: string;
      startDate: string;
      endDate?: string;
      returned: boolean;
      notes?: string;
    }[];
  }[];
}

export async function fetchPublicInventory(
  token: string
): Promise<PublicInventory> {
  const response = await fetch(`/api/public/inventory/${token}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Inventario no encontrado');
    }
    throw new Error(`Error: ${response.status}`);
  }
  
  return response.json();
}

// Componente
import { useQuery } from '@tanstack/react-query';

export function PublicInventoryView({ token }: { token: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['inventory', token],
    queryFn: () => fetchPublicInventory(token),
    retry: false,
  });

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>Error: {(error as Error).message}</p>;
  if (!data) return <p>No encontrado</p>;

  return (
    <div>
      <h1>{data.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.items.map((item) => (
          <div key={item.id} className="border p-4 rounded">
            <h2>{item.name}</h2>
            <p className="text-gray-600">{item.description}</p>
            <div className="mt-2">
              <span className="badge">
                {item.amount} disponible
              </span>
            </div>
            {item.loans.length > 0 && (
              <div className="mt-3 bg-yellow-50 p-2 rounded">
                <p className="text-sm font-semibold">En préstamo:</p>
                {item.loans.map((loan) => (
                  <p key={loan.id} className="text-sm">
                    {loan.borrowerName}
                    {loan.borrowerContact && ` (${loan.borrowerContact})`}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔗 Casos de Uso

### 1. **Dashboard Compartido**
Mostrar inventario de herramientas de un taller en la entrada.

```typescript
// Se renderiza en pantalla compartida sin login
const token = "550e8400-e29b-41d4-a716-446655440000";
const inventory = await fetchPublicInventory(token);
// Mostrar disponibilidad en tiempo real
```

### 2. **QR Code Scanner**
Escanear QR que apunta a inventario público.

```
QR Decode: 
  → https://inventario.app/public/inventory/550e8400-e29b-41d4-a716-446655440000
  → Fetch API endpoint
  → Renderizar datos
```

### 3. **Widget Embebido**
Incrustar disponibilidad de items en otro sitio.

```html
<iframe src="https://inventario.app/public/inventory/550e8400-e29b-41d4-a716-446655440000"></iframe>
```

### 4. **Integración con Otras Apps**
Conectar inventario con CRM, ERP, etc.

```typescript
// App externa quiere saber disponibilidad
const response = await fetch(
  'https://inventario.app/api/public/inventory/[token]'
);
const inventory = await response.json();
// Sincronizar con base de datos propia
```

### 5. **Aplicación Móvil**
App móvil que consulta inventario sin requerir login.

```typescript
// Flutter, React Native, etc.
final response = await http.get(
  Uri.parse('https://inventario.app/api/public/inventory/$token')
);
final inventory = json.decode(response.body);
```

---

## 🔒 Consideraciones de Seguridad

### ✅ Lo que SÍ compartimos

- ✅ Items disponibles
- ✅ Nombre del inventario
- ✅ Áreas/secciones
- ✅ Información de préstamos activos (quién y cuándo)
- ✅ Precio de items
- ✅ URLs a manuales

### ❌ Lo que NO compartimos

- ❌ Identificación del propietario
- ❌ Email del propietario
- ❌ Historial completo de préstamos
- ❌ Datos del usuario que pide prestado (contacto privado)
- ❌ Otros inventarios del usuario
- ❌ Transacciones o movimientos

### 🛡️ Características de Seguridad

1. **Token UUID Único**
   - No es predecible
   - Se genera criptográficamente
   - No reutilizable

2. **Sin Autenticación**
   - Pero el acceso es mediante token
   - No expone datos sensibles

3. **Rate Limiting (Recomendado)**
   ```
   # En producción implementar:
   - Max 100 requests/minuto por IP
   - Timeout en conexiones
   - Cache en cliente
   ```

4. **Validación de Token**
   - Verifica que existe en BD
   - Si no existe → 404

---

## ⚙️ Implementación (Backend)

### Archivo: `src/app/api/public/inventory/[token]/route.ts`

```typescript
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { db } from "~/server/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    // Validar token
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      );
    }

    // Buscar inventario por token público
    const inventory = await db.inventory.findFirst({
      where: {
        publicToken: token,
      },
      include: {
        areas: true,
        items: {
          include: {
            loans: {
              where: { returned: false }, // Solo préstamos activos
            },
          },
        },
      },
    });

    // Si no existe
    if (!inventory) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    // Retornar solo datos necesarios
    return NextResponse.json({
      id: inventory.id,
      name: inventory.name,
      areas: inventory.areas,
      items: inventory.items,
    });
    
  } catch (error) {
    console.error("Error in public inventory endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## 📊 Estadísticas de Uso

### Monitoreo Recomendado

```typescript
// Registrar accesos a API pública
- Total requests por token
- Endpoints más consultados
- Usuarios únicos (por IP)
- Errores 404
- Tiempos de respuesta
```

---

## 🔄 Alternativas y Extensiones

### Posibles Mejoras Futuras

```typescript
// 1. Autenticación opcional
// GET /api/public/inventory/[token]?apiKey=xxx

// 2. Filtros
// GET /api/public/inventory/[token]?area=herramientas&available=true

// 3. Paginación
// GET /api/public/inventory/[token]?page=1&limit=20

// 4. Export CSV
// GET /api/public/inventory/[token]?format=csv

// 5. Webhooks
// POST /api/webhooks para notificaciones
```

---

## 📞 Soporte

**Para problemas:**

1. Verificar que el token es válido (UUID)
2. Confirmar que inventario tiene `publicToken` en BD
3. Revisar logs del servidor
4. Usar Prisma Studio para debugging

```bash
npm run db:studio
# Buscar en tabla Inventory → publicToken
```

---

**Última actualización:** 30 de Marzo de 2026
