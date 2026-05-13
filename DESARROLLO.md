# Café del Rey — Documentación de Desarrollo

> Registro completo del desarrollo: integración de FastAPI, panel de superadmin con CRUD de productos, carrusel en landing, diseño responsive, deploy en Windows/Podman y correcciones acumuladas.

---

## Índice

1. [Punto de partida](#1-punto-de-partida)
2. [Fase 1 — Backend FastAPI](#2-fase-1--backend-fastapi)
3. [Fase 2 — Docker Compose actualizado](#3-fase-2--docker-compose-actualizado)
4. [Fase 3 — Tipos e integración dinámica de productos](#4-fase-3--tipos-e-integración-dinámica-de-productos)
5. [Fase 4 — Skeleton y animaciones](#5-fase-4--skeleton-y-animaciones)
6. [Fase 5 — Proxy de autenticación (Next.js 16)](#6-fase-5--proxy-de-autenticación-nextjs-16)
7. [Fase 6 — Panel de superadmin](#7-fase-6--panel-de-superadmin)
8. [Fase 7 — Mejoras UX/UI](#8-fase-7--mejoras-uxui)
9. [Fase 8 — Migración a Podman](#9-fase-8--migración-a-podman)
10. [Fase 9 — Deploy en Windows](#10-fase-9--deploy-en-windows)
11. [Correcciones y mejoras adicionales](#11-correcciones-y-mejoras-adicionales)
12. [Fase 10 — Diseño responsive](#12-fase-10--diseño-responsive)
13. [Fase 11 — CRUD completo de productos en el admin](#13-fase-11--crud-completo-de-productos-en-el-admin)
14. [Fase 12 — Carrusel de productos en la landing](#14-fase-12--carrusel-de-productos-en-la-landing)
15. [Árbol de archivos final](#15-árbol-de-archivos-final)
16. [Guía de uso rápido](#16-guía-de-uso-rápido)

---

## 1. Punto de partida

El proyecto **Café del Rey** era un frontend Next.js 16 (App Router) completo, con:

| Aspecto | Estado inicial |
|---|---|
| Framework | Next.js 16 + React 19 + TypeScript 5 |
| Estilos | Tailwind CSS v4 + sistema de tokens CSS (`styles/tokens/`) |
| Design system | 13 componentes atómicos propios en `design-system/components/` |
| Productos | Array estático hardcodeado en `app/page.tsx` |
| Imágenes | SVG procedural `BagMock.tsx` para todos los productos |
| Backend | Sin backend — solo Server Actions para cookies de tema |
| Infraestructura | Docker Compose con un único servicio (frontend en puerto 4001) |

### Paleta de colores del proyecto

```
--cafe-terracotta: #de6f14  (headers, acento cálido)
--cafe-river:      #0B3D2E  (sección tienda, verde oscuro)
--cafe-lilac:      #c8aacb  (manifiesto, púrpura suave)
--cafe-yungas:     #3f6b3e  (proceso, verde lush)
--cafe-paper:      #f7f2ea  (fondo claro)
--cafe-ink:        #0e0f0c  (texto oscuro)
```

### Tipografía

- **Merienda** (Google Fonts) — display / headings
- **Azeret Mono** (Google Fonts) — body / UI (monospace editorial)

---

## 2. Fase 1 — Backend FastAPI

**Objetivo:** crear un servicio REST que persista los productos en SQLite y permita a un superadmin subir/cambiar/eliminar fotos de productos mediante JWT.

### Archivos creados

```
api/
├── Dockerfile          # Python 3.12-slim + uvicorn
├── requirements.txt    # dependencias Python
├── .env.example        # plantilla de variables de entorno
├── .env                # credenciales dev (ignorado por .gitignore)
├── main.py             # app FastAPI principal
├── database.py         # conexión SQLite + init_db()
├── models.py           # funciones CRUD sobre la tabla products
├── schemas.py          # modelos Pydantic (request/response)
├── auth.py             # JWT con python-jose + verificación de credenciales
├── seed.py             # siembra inicial de los 3 productos
└── routes/
    ├── __init__.py
    ├── auth.py         # POST /auth/login
    └── products.py     # GET/POST /products  GET/PUT/DELETE /products/{id}  imagen
```

### Esquema de la base de datos

**Tabla `products` (SQLite)**

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | TEXT PK | Slug generado desde el nombre, ej: `"rey-miel-a1b2c3"` |
| `name` | TEXT | Nombre del café |
| `note` | TEXT | Descripción corta |
| `origin` | TEXT | Ej: `"Caranavi · Yungas"` |
| `process` | TEXT | Honey / Lavado / Natural / Anaeróbico / Experimental |
| `elevation` | TEXT | Ej: `"1,450–1,750 msnm"` |
| `sticker_text` | TEXT | Texto del sticker SVG |
| `sticker_color` | TEXT | Color CSS del sticker |
| `sizes_json` | TEXT | Array de tallas serializado como JSON |
| `sold_out` | INTEGER | 0/1, default 0 |
| `image_filename` | TEXT | Nombre del archivo en `/app/uploads/`, NULL si sin imagen |

> `sizes_json` usa serialización JSON en una columna TEXT porque las tallas (label + price) no justifican una tabla de join para un admin de usuario único.

### Endpoints de la API

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/auth/login` | No | `{ username, password }` → `{ access_token }` |
| `GET` | `/products` | No | Lista todos los productos con `image_url` |
| `GET` | `/products/{id}` | No | Producto individual |
| `POST` | `/products` | Bearer JWT | Crea un producto nuevo (ver Fase 11) |
| `PUT` | `/products/{id}` | Bearer JWT | Actualiza datos de un producto (ver Fase 11) |
| `DELETE` | `/products/{id}` | Bearer JWT | Elimina el producto y su imagen (ver Fase 11) |
| `POST` | `/products/{id}/image` | Bearer JWT | Sube o reemplaza la imagen (`multipart/form-data`) |
| `DELETE` | `/products/{id}/image` | Bearer JWT | Elimina la imagen (vuelve al fallback BagMock) |
| `GET` | `/uploads/{filename}` | No | Sirve archivos de imagen (FastAPI `StaticFiles`) |
| `GET` | `/health` | No | `{ status: "ok" }` — health check |
| `GET` | `/docs` | No | Swagger UI generado automáticamente por FastAPI |

### Flujo de autenticación de la API

```
Cliente → POST /auth/login { username, password }
FastAPI → verifica contra ADMIN_USERNAME/ADMIN_PASSWORD del .env
FastAPI → genera JWT con python-jose (exp = 8 horas)
FastAPI → devuelve { access_token, token_type: "bearer" }

Cliente → POST /products/{id}/image
          Authorization: Bearer <token>
FastAPI → valida JWT con get_current_admin dependency
FastAPI → guarda archivo en /app/uploads/{id}-{uuid8}.ext
FastAPI → actualiza image_filename en SQLite
FastAPI → devuelve { image_url: "http://host:8000/uploads/..." }
```

### Comportamiento del arranque

`main.py` usa un `lifespan` context manager que al iniciar:

1. Crea el directorio `/app/uploads` si no existe
2. Llama `init_db()` — crea la tabla `products` si no existe
3. Llama `seed()` — inserta los 3 productos originales **solo si no existen** (idempotente)

### Variables de entorno del API

```env
ADMIN_USERNAME=superadmin
ADMIN_PASSWORD=cafedelrey2025
JWT_SECRET=secreto_jwt_cambiar_en_produccion
JWT_EXPIRE_HOURS=8
UPLOADS_DIR=/app/uploads
DB_PATH=/app/data/cafe.db
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4001
```

---

## 3. Fase 2 — Docker Compose actualizado

**Objetivo:** orquestar el frontend y el nuevo servicio API juntos.

### `docker-compose.yml` — cambios

```yaml
services:
  api:           # ← NUEVO: servicio FastAPI
    build: ./api
    ports: ["8000:8000"]
    volumes:
      - uploads:/app/uploads   # imágenes subidas
      - db_data:/app/data      # base de datos SQLite

  frontend:
    environment:
      NEXT_PUBLIC_API_URL: "http://localhost:8000"  # ← NUEVO: URL pública
      API_INTERNAL_URL: "http://api:8000"           # ← NUEVO: red interna Docker
    depends_on: [api]         # ← NUEVO

volumes:
  uploads:   # ← NUEVO: compartido entre servicios
  db_data:   # ← NUEVO: persistencia SQLite
```

### Por qué dos URLs para el API

| Variable | Valor | Usado por | Motivo |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Navegador del cliente | Las llamadas desde el cliente van al host |
| `API_INTERNAL_URL` | `http://api:8000` | Servidor Next.js (RSC / Server Actions) | Las llamadas server-side usan la red interna de Docker |

---

## 4. Fase 3 — Tipos e integración dinámica de productos

**Objetivo:** que la página pública consuma los productos del API en lugar del array estático.

### Archivos creados / modificados

#### `types/api.ts` (nuevo)

Define el contrato TypeScript entre el API y el frontend:

```typescript
type ApiProduct = {
  id, name, note, origin, process, elevation,
  sticker_text, sticker_color, sizes, sold_out, image_url
}

// Convierte URL absoluta de la API → ruta proxy local "/api/uploads/..."
// Evita que "http://api:8000" (hostname interno Docker) llegue al navegador
function toProxyUrl(imageUrl: string | null | undefined): string | undefined

// Mapea ApiProduct → CafeProduct (formato interno del frontend)
// Aplica toProxyUrl en image_url automáticamente
function mapApiProduct(p: ApiProduct): CafeProduct

// Fetch con ISR: revalida cada 60 segundos
async function fetchProducts(): Promise<CafeProduct[]>
```

#### `components/cafe/ShopItem.tsx` (modificado)

Agregado el campo `imageUrl?: string` al tipo `CafeProduct`. Reemplazado `<BagMock>` por `<ProductImage>`.

#### `components/cafe/ProductImage.tsx` (nuevo)

Componente que decide qué renderizar:

```
imageUrl existe → <Image> de Next.js (object-cover, hover scale)
imageUrl no existe → <BagMock> SVG original (comportamiento anterior)
```

#### `app/page.tsx` (modificado)

```typescript
// Antes: array estático
const products: CafeProduct[] = [ ... ];

// Ahora: async Server Component + Suspense
export default function CafeHome() {
  return (
    <Suspense fallback={<ShopSection products={null} />}>
      <ShopAsync />   {/* fetchea del API server-side */}
    </Suspense>
  );
}
```

#### `next.config.ts` (modificado)

```typescript
images: {
  remotePatterns: [{
    protocol: "http",
    hostname: "localhost",
    port: "8000",
    pathname: "/uploads/**",
  }]
}
```

---

## 5. Fase 4 — Skeleton y animaciones

**Objetivo:** mejorar la percepción de carga y agregar animaciones de entrada sutiles.

### `components/cafe/ShopItemSkeleton.tsx` (nuevo)

Replica el layout de `ShopItem` con elementos `animate-pulse` y colores en `transparent`:

```
┌─────────────────────┐
│  █████████████████  │  ← imagen placeholder (aspect-[11/12])
│  ███ ████████████   │  ← origen + nombre
│  ███████████████    │  ← nota
│  ●●● ●●● ●●●        │  ← botones de talla
│  ●●●●●● ●●●●●●●    │  ← qty + botón añadir
└─────────────────────┘
```

`ShopSkeletons` renderiza 3 instancias mientras el API responde.

### `styles/globals.css` (modificado)

```css
@keyframes slide-up-fade {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

@utility animate-entry {
  animation: slide-up-fade 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
}
```

Las tarjetas de producto usan `animation-delay` escalonado (`0ms`, `80ms`, `160ms`, …) para el efecto cascada.

---

## 6. Fase 5 — Proxy de autenticación (Next.js 16)

**Objetivo:** proteger todas las rutas `/admin/**` en Next.js.

### Breaking change de Next.js 16

| Aspecto | Next.js 15 y anteriores | Next.js 16 |
|---|---|---|
| Nombre del archivo | `middleware.ts` | `proxy.ts` |
| Nombre de la función exportada | `middleware` | `proxy` |

Si coexisten ambos archivos o se usa el nombre incorrecto, Next.js lanza un error de arranque.

### `proxy.ts` (raíz del proyecto)

```typescript
export const config = { matcher: ["/admin/:path*"] };

export function proxy(request: NextRequest) {
  // /admin/login siempre accesible (evita loop de redirección)
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get("admin_token")?.value;
  if (!token) return redirect("/admin/login");

  // Decodifica payload JWT sin verificar firma — solo para expiración rápida
  const [, payloadB64] = token.split(".");
  const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("admin_token");
    return response;
  }

  return NextResponse.next();
}
```

> **Nota de seguridad:** el proxy solo verifica la expiración sin la clave secreta. La verificación criptográfica completa ocurre en las Server Actions antes de cada operación sensible.

---

## 7. Fase 6 — Panel de superadmin

**Objetivo:** interfaz web para que el administrador gestione las fotos de productos.

### Archivos del panel admin (versión inicial)

```
app/
├── actions/admin.ts        ← Server Actions (lógica de negocio)
└── admin/
    ├── layout.tsx           ← Layout con AdminHeader + ToastProvider
    ├── page.tsx             ← Dashboard (Server Component)
    └── login/
        └── page.tsx         ← Formulario de login

components/admin/
├── AdminHeader.tsx          ← Header con botón logout
├── ProductTable.tsx         ← Tabla de productos con acciones
├── ImageUploadModal.tsx     ← Modal con file picker + preview
├── ProductCreateModal.tsx   ← Modal de creación (Fase 11)
└── ProductEditModal.tsx     ← Modal de edición (Fase 11)
```

### Flujo completo de autenticación admin

```
1. Usuario visita /admin
   └── proxy.ts lee cookie "admin_token"
       ├── no existe → redirect /admin/login
       └── expirado  → borra cookie + redirect /admin/login

2. Usuario completa formulario en /admin/login
   └── form action={loginAction}

3. loginAction (Server Action)
   ├── POST http://api:8000/auth/login  (red interna Docker)
   ├── Si error → retorna { error: "Credenciales incorrectas" }
   └── Si OK    → guarda JWT en cookie httpOnly, maxAge 8h
                  → redirect("/admin")

4. /admin renderiza como Server Component
   ├── fetch http://api:8000/products  (server-side)
   └── renderiza <ProductTable initialProducts={...} />

5. ProductTable (Client Component)
   ├── Botón "+ Nuevo producto" → ProductCreateModal
   ├── Botón "Editar" por fila → ProductEditModal
   ├── Botón "📷 / Foto" por fila → ImageUploadModal
   └── Botón "Eliminar" con confirmación de 2 pasos → deleteProductAction
```

### Por qué Server Actions para el admin

El token JWT **nunca llega al navegador del usuario**:

- Vive en una cookie `httpOnly` (inaccesible desde JavaScript del cliente)
- Las llamadas al API backend se hacen desde el servidor de Next.js
- El cliente solo ve el resultado de la operación (URL de la imagen o error)

---

## 8. Fase 7 — Mejoras UX/UI

**Objetivo:** pulir la experiencia visual usando el design system existente.

### Cambios en `CafeHeader.tsx`

Se eliminaron dos enlaces de navegación que no pertenecen a la experiencia pública:

| Enlace eliminado | Destino | Motivo |
|---|---|---|
| **UI** (nav escritorio) | `/design-system` | Ruta interna de desarrollo |
| **Módulo GD (demo)** (menú desplegable) | `/gd` | Demo de otro proyecto |

El header quedó limpio con solo: **Tienda · Historia · Proceso · Contacto**

### Cambios en `ShopItem.tsx`

| Antes | Después |
|---|---|
| `hover:-translate-y-0.5` | `hover:-translate-y-1` + `hover:shadow-[var(--ui-shadow)]` |
| `transition-transform` | `transition-all duration-300` |
| `<BagMock>` directo | `<ProductImage>` (real o fallback) |
| `<details>` sin indicador | `<details>` con `+` / `-` |
| Sin clase `group` | Con clase `group` |

---

## 9. Fase 8 — Migración a Podman

**Objetivo:** permitir ejecutar el stack completo con Podman (alternativa open-source a Docker).

### ¿Por qué Podman?

| Característica | Docker | Podman |
|---|---|---|
| Daemon | Requiere `dockerd` corriendo | Sin daemon (daemonless) |
| Privilegios | Requiere root o grupo `docker` | Rootless por defecto |
| Licencia | Apache 2.0 (Docker Desktop: comercial) | Apache 2.0 |

### Diferencias clave para este proyecto

#### Volúmenes bind-mount en modo rootless

```yaml
frontend:
  userns_mode: "keep-id"   # mapea UID/GID del host al contenedor
  volumes:
    - .:/app:z             # :z relabela el contexto SELinux (Fedora/RHEL)
```

#### Comando

```bash
# Docker
docker compose -f docker-compose.yml up --build

# Podman (Podman >= 4.4 built-in)
podman compose -f podman-compose.yml up --build
```

### Archivos creados para Podman

| Archivo | Propósito |
|---|---|
| `podman-compose.yml` | Compose file con ajustes rootless (`userns_mode`, `:z`) |
| `setup-podman.sh` | Script de instalación para Ubuntu, Fedora, Debian, macOS |
| `Makefile` | Atajos `make podman-up`, `make up`, `make logs`, etc. |

---

## 10. Fase 9 — Deploy en Windows

**Objetivo:** ejecutar el stack en Windows con Podman Desktop o de forma nativa.

### 10.1 Con Podman Desktop (recomendado)

Podman Desktop en Windows usa **WSL2** como backend y **Docker Compose v5** como provider.

```powershell
cd E:\Trabajos\cafe_del_rey
podman compose up --build
```

> `podman compose` sin flags usa `docker-compose.yml` por defecto.

#### Diferencias en Windows con Podman Desktop

| Aspecto | Comportamiento |
|---|---|
| `userns_mode: keep-id` | Ignorado — la VM WSL2 ya mapea UIDs correctamente |
| `:z` SELinux label | Ignorado — WSL2 no usa SELinux |
| Red interna `http://api:8000` | Funciona igual que Docker |

### 10.2 Deploy nativo en Windows (sin contenedores)

#### Archivos creados

```
deploy/windows/
├── setup.ps1        ← instalación completa (una sola vez)
├── start-dev.ps1    ← modo desarrollo (hot-reload en ambos servicios)
├── start-prod.ps1   ← modo producción con PM2
└── stop.ps1         ← detiene todos los servicios

pm2.config.cjs       ← configuración PM2 (raíz del proyecto)
```

#### Paso 1 — Setup inicial (una sola vez)

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
.\deploy\windows\setup.ps1
```

El script realiza: verifica Node ≥ 18 y Python ≥ 3.10, crea venv, instala dependencias, hace `npm install` y `npm run build`, instala PM2.

#### Paso 2A — Modo desarrollo

```powershell
.\deploy\windows\start-dev.ps1
# Abre dos ventanas: API en :8000 y frontend en :4001, ambos con hot-reload
```

#### Paso 2B — Modo producción con PM2

```powershell
.\deploy\windows\start-prod.ps1
pm2 list        # ver estado
pm2 logs        # logs en tiempo real
pm2 monit       # dashboard interactivo
```

### 10.3 Resumen comparativo

| | Podman Desktop | Nativo (PM2) |
|---|---|---|
| Aislamiento | ✅ Contenedores | ❌ Procesos del sistema |
| Velocidad setup | ⚡ Un comando | 🐢 Setup inicial más largo |
| Hot-reload dev | ✅ Con polling | ✅ Nativo |
| Requiere Docker/Podman | ✅ Sí | ❌ No |

---

## 11. Correcciones y mejoras adicionales

### 11.1 Proxy interno para imágenes de productos

**Problema:**

```
GET /_next/image?url=http%3A%2F%2Fapi%3A8000%2Fuploads%2Frey-1.PNG 400 Bad Request
⨯ upstream image http://api:8000/uploads/rey-1.PNG resolved to private ip ["10.89.0.2"]
```

**Causa raíz:** Next.js 16 bloquea el optimizador de imágenes cuando la URL destino resuelve a una IP privada (protección anti-SSRF), incluso si el hostname está en `remotePatterns`.

**Solución — proxy route `app/api/uploads/[...path]/route.ts`:**

```
Navegador / next/image optimizer
  → GET /api/uploads/rey-1.PNG          (same-origin, siempre permitido)
  → Route handler en Next.js
    → fetch http://api:8000/uploads/rey-1.PNG   (red interna Docker, trusted)
    → devuelve imagen con Cache-Control: immutable
```

`toProxyUrl()` en `types/api.ts` convierte cualquier URL absoluta en la ruta proxy:

```typescript
// "http://api:8000/uploads/foo.png"  →  "/api/uploads/foo.png"
function toProxyUrl(imageUrl: string | null | undefined): string | undefined {
  if (!imageUrl) return undefined;
  const match = imageUrl.match(/\/uploads\/(.+)$/);
  return match ? `/api/uploads/${match[1]}` : undefined;
}
```

### 11.2 Limpieza de navegación

Se eliminaron dos enlaces del `CafeHeader` que no pertenecían a la experiencia pública (`/design-system` y `/gd`).

### 11.3 ToastProvider en el layout del admin

`useToast()` lanza un error si no encuentra el contexto del proveedor. Aunque el root layout (`app/layout.tsx`) envuelve todo con `ToastProvider` vía `AppProviders`, el layout del admin fue actualizado para incluirlo explícitamente:

```typescript
// app/admin/layout.tsx
export default function AdminLayout({ children }) {
  return (
    <ToastProvider>
      <div className="min-h-dvh bg-bg text-fg">
        <AdminHeader />
        <main>{children}</main>
      </div>
    </ToastProvider>
  );
}
```

Esto garantiza que los toasts de `ProductTable` (eliminar, crear, editar) funcionen correctamente incluso si cambia el árbol de providers del root layout.

---

## 12. Fase 10 — Diseño responsive

**Objetivo:** adaptar la app para PC, tablets y dispositivos móviles en orientación portrait.

### Problema de partida

La app asumía siempre una pantalla ancha:
- `RotateHint.tsx` bloqueaba toda la vista con un overlay en pantallas portrait (≤840px de ancho)
- El header usaba `<details>/<summary>` HTML, que no soporta cierre programático
- Los grids usaban `md:` (768px) como primer breakpoint, dejando tablets en portrait con una sola columna
- Los botones de los productos no tenían `touch-manipulation` (delay de 300ms en iOS)

### Cambios por archivo

#### `components/cafe/RotateHint.tsx`

Simplemente devuelve `null`. El overlay ya no se muestra nunca.

```typescript
export function RotateHint() { return null; }
```

#### `components/cafe/CafeHeader.tsx` — conversión a `"use client"`

Reemplazó el patrón `<details>/<summary>` por gestión de estado con React:

```typescript
"use client";
export function CafeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Cierra con Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen]);

  // Bloquea scroll del body cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 ...">...</header>
      {menuOpen && (
        <>
          {/* Backdrop — cierra al hacer clic fuera */}
          <div className="fixed inset-0 z-30 bg-bg/60 backdrop-blur-sm"
               onClick={() => setMenuOpen(false)} aria-hidden />
          {/* Panel del menú — fuera del <header> para evitar conflictos z-index */}
          <div className="fixed right-[var(--space-page-x)] top-[calc(4rem+1px)] z-50 ...">
            {/* Links con onClick={() => setMenuOpen(false)} */}
          </div>
        </>
      )}
    </>
  );
}
```

**Por qué el panel está fuera del `<header>`:** el `<header>` tiene `position: sticky` con `z-40`, lo que crea un contexto de apilamiento. Si el menú desplegable es hijo del header, queda atrapado en ese contexto y puede quedar por detrás de otros elementos. Renderizarlo como hermano del header (fuera del contexto) con `z-50` garantiza que siempre esté encima.

#### Breakpoints responsive ajustados

| Componente | Antes | Después |
|---|---|---|
| `ShopSection` (grid de productos) | `md:grid-cols-2 xl:grid-cols-3` | `sm:grid-cols-2 xl:grid-cols-3` |
| `ShopItemSkeleton` (grid skeleton) | `md:grid-cols-2 xl:grid-cols-3` | `sm:grid-cols-2 xl:grid-cols-3` |
| `ProcessStrip` | `sm:grid-cols-2 lg:grid-cols-4` | `grid-cols-2 md:grid-cols-4` |
| `Footer` (colofón) | sin breakpoint extra | `sm:col-span-2 lg:col-span-3` |

> Cambiar `md:` (768px) a `sm:` (640px) en el grid de la tienda permite que tablets en portrait (640–768px) vean 2 columnas en lugar de 1.

#### `components/cafe/ShopItem.tsx`

```diff
- <div className="flex items-center gap-2">
+ <div className="flex flex-wrap items-center gap-2">

- <Button className="flex-1 rounded-full ...">
+ <Button className="flex-1 min-w-[120px] rounded-full active:scale-[0.97] ...">

  <button className="h-10 w-10 ... hover:bg-muted">
+ className="... active:bg-muted touch-manipulation"
```

`touch-manipulation` elimina el retraso de 300ms en iOS/Android al pulsar botones.

#### `components/admin/AdminHeader.tsx`

```diff
- <span>Café del Rey — Panel Admin</span>
+ <span className="truncate min-w-0">
+   <span className="hidden sm:inline">Café del Rey — </span>Panel Admin
+ </span>
```

En móvil solo muestra "Panel Admin"; en sm+ muestra el nombre completo.

---

## 13. Fase 11 — CRUD completo de productos en el admin

**Objetivo:** pasar de 3 productos fijos (seed) a un número ilimitado, gestionables íntegramente desde el panel admin — crear, editar datos y eliminar.

### 13.1 Backend — nuevos endpoints y funciones

#### `api/schemas.py` — nuevo schema `ProductCreate`

```python
class ProductCreate(BaseModel):
    name: str
    note: str
    origin: str
    process: str
    elevation: str = ""
    sticker_text: str = ""
    sticker_color: str = "#de6f14"
    sizes: list[SizeItem] = []
    sold_out: bool = False
```

Se reutiliza como body para el `PUT` (actualización completa).

#### `api/models.py` — tres nuevas funciones

```python
def create_product(data: dict, base_url: str) -> Optional[ProductOut]:
    """Genera ID como slug del nombre + 6 hex aleatorios."""
    slug = re.sub(r"[^a-z0-9]+", "-", data["name"].lower()).strip("-")
    product_id = f"{slug}-{uuid.uuid4().hex[:6]}"
    # INSERT INTO products (...) VALUES (...)
    return get_product(product_id, base_url)

def update_product(product_id: str, data: dict, base_url: str) -> Optional[ProductOut]:
    """Actualiza todos los campos de texto/metadata. NO toca image_filename."""
    # UPDATE products SET name=?, note=?, ... WHERE id=?
    # rowcount == 0 → retorna None (producto no encontrado)
    return get_product(product_id, base_url)

def delete_product(product_id: str) -> bool:
    """Elimina el archivo físico de imagen y la fila de BD."""
    # 1. SELECT image_filename → os.remove(filepath) si existe
    # 2. DELETE FROM products WHERE id=?
    return result.rowcount > 0
```

#### `api/routes/products.py` — nuevas rutas

```python
@router.post("", response_model=ProductOut, status_code=201)
def create_product_endpoint(data: ProductCreate, request, _=Depends(get_current_admin)):
    ...

@router.put("/{product_id}", response_model=ProductOut)
def update_product_endpoint(product_id, data: ProductCreate, request, _=Depends(get_current_admin)):
    ...

@router.delete("/{product_id}", response_model=OkResponse)
def delete_product_endpoint(product_id, _=Depends(get_current_admin)):
    ...
```

> **Importante:** tras cambios en el código Python hay que reconstruir el contenedor API:
> ```bash
> podman compose up --build -d api
> ```

### 13.2 Server Actions — `app/actions/admin.ts`

Las tres acciones comparten el mismo patrón de parseo de FormData:

```typescript
// Recolecta hasta 5 filas de talla (size_label_N / size_price_N)
const sizes = [];
for (let i = 1; i <= 5; i++) {
  const label = (formData.get(`size_label_${i}`) as string)?.trim();
  const price = (formData.get(`size_price_${i}`) as string)?.trim();
  if (label && price) sizes.push({ label, price });
}

const body = {
  name, note, origin, process, elevation,
  sticker_text, sticker_color, sizes,
  sold_out: formData.get("sold_out") === "true",
};
```

| Action | Método HTTP | Descripción |
|---|---|---|
| `createProductAction(fd)` | `POST /products` | Crea producto, devuelve `{ product }` o `{ error }` |
| `updateProductAction(id, fd)` | `PUT /products/{id}` | Actualiza datos, devuelve `{ product }` o `{ error }` |
| `deleteProductAction(id)` | `DELETE /products/{id}` | Elimina, devuelve `{}` o `{ error }` |

### 13.3 Modales — `ProductCreateModal` y `ProductEditModal`

Ambos comparten la misma estructura de formulario:

```
┌─────────────────────────────────────────────┐
│  Nombre del café        │  Origen            │
├─────────────────────────────────────────────┤
│  Descripción corta                           │
├─────────────────────────────────────────────┤
│  Proceso (select)       │  Altura (opcional) │
├─────────────────────────────────────────────┤
│  Tallas y precios                            │
│  [Presentación] [Precio]  [×]               │
│  [Presentación] [Precio]  [×]               │
│  + Agregar talla (hasta 5)                  │
├─────────────────────────────────────────────┤
│  Texto del sticker      │  ● Color sticker   │
├─────────────────────────────────────────────┤
│  ☐ Marcar como agotado                       │
├─────────────────────────────────────────────┤
│  [Crear / Guardar cambios]    [Cancelar]    │
└─────────────────────────────────────────────┘
```

**Diferencias entre Create y Edit:**

| Aspecto | `ProductCreateModal` | `ProductEditModal` |
|---|---|---|
| Props | `onClose, onSuccess` | `product: ApiProduct, onClose, onSuccess` |
| Valores iniciales | Campos vacíos | `defaultValue={product.field}` en inputs |
| Proceso inicial | `"Honey"` | `product.process` (con fallback al primero del select si el valor es legacy) |
| Color inicial | `"#de6f14"` | `product.sticker_color` (con fallback si no está en la lista) |
| `sizeCount` inicial | `1` | `Math.max(1, product.sizes.length)` |
| Acción | `createProductAction(fd)` | `updateProductAction(product.id, fd)` |
| Título del modal | `"Nuevo producto"` | `"Editar — {product.name}"` |
| Botón submit | `"Crear producto"` | `"Guardar cambios"` |

**Nota sobre colores legacy:** los productos sembrados en el seed original tienen colores en formato CSS (`color-mix(in oklab, ...)`) en lugar de hex. El `ProductEditModal` detecta si el color del producto está en el array `STICKER_COLORS`; si no lo está, cae al primero del select sin errores.

### 13.4 `ProductTable` — integración completa

```typescript
// Estados independientes para cada modal
const [creating, setCreating] = useState(false);
const [editingData, setEditingData] = useState<ApiProduct | null>(null);   // datos
const [editingImage, setEditingImage] = useState<ApiProduct | null>(null); // foto
const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

// Handlers que actualizan el estado local sin re-fetch
function handleCreated(product)  { setProducts(prev => [...prev, product]); }
function handleUpdated(product)  { setProducts(prev => prev.map(p => p.id === product.id ? product : p)); }
function handleImageUpdate(id, url) { setProducts(prev => prev.map(p => p.id === id ? {...p, image_url: url} : p)); }
```

**Columna de acciones por fila:**

```
[Editar]  [📷 / Foto]  [Eliminar]
                        → clic → [Confirmar]  [Cancelar]
```

El botón "Eliminar" requiere una confirmación explícita (dos clics) para evitar borrados accidentales.

---

## 14. Fase 12 — Carrusel de productos en la landing

**Objetivo:** reemplazar el grid estático de 3 productos por un carrusel que muestre cualquier número de productos dinámicamente.

### `components/cafe/ProductCarousel.tsx`

Componente cliente con scroll-snap CSS + navegación JavaScript.

#### Anchos de tarjeta por breakpoint

| Breakpoint | Tarjetas visibles | Ancho de tarjeta | Espaciador trailing |
|---|---|---|---|
| `default` (móvil) | 1 (siguiente asoma) | `w-[85%]` | `w-[15%]` |
| `sm` (≥640px) | 2 | `w-[calc(50%-8px)]` | `w-[calc(50%+8px)]` |
| `xl` (≥1280px) | 3 | `w-[calc(33.333%-11px)]` | `w-[calc(66.667%+11px)]` |

> **Por qué el espaciador trailing:** CSS `snap-start` intenta colocar el borde izquierdo de cada tarjeta en el borde izquierdo del viewport. Sin espaciador, la última tarjeta no puede desplazarse hasta esa posición porque el `scrollWidth` no es suficiente. El espaciador llena el espacio restante para que la condición `scrollLeft_max ≥ offsetLeft_última_tarjeta` se cumpla.
>
> El ancho mínimo del espaciador es `contenedor - tarjeta`. Para `sm`: `100% - (50%-8px) = 50%+8px`. Para `xl`: `100% - (33.333%-11px) ≈ 66.667%+11px`.

#### Estructura del track

```tsx
<div ref={trackRef} onScroll={syncState}
     className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory
                [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

  {products.map((p, i) => (
    <div key={p.id} data-card
         className="flex-none snap-start w-[85%] sm:w-[calc(50%-8px)] xl:w-[calc(33.333%-11px)]">
      <ShopItem product={p} />
    </div>
  ))}

  {/* Espaciador: permite que la última tarjeta llegue al snap-start */}
  <div aria-hidden className="flex-none w-[15%] sm:w-[calc(50%+8px)] xl:w-[calc(66.667%+11px)]" />
</div>
```

#### Lógica de navegación

```typescript
// Detecta la tarjeta más cercana al borde izquierdo del viewport
function syncState() {
  const cards = track.querySelectorAll("[data-card]");
  let nearest = 0, minDist = Infinity;
  cards.forEach((card, i) => {
    const dist = Math.abs(card.offsetLeft - track.scrollLeft);
    if (dist < minDist) { minDist = dist; nearest = i; }
  });
  setActiveIdx(nearest);
  setAtStart(track.scrollLeft <= 4);
  setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 4);
}

// Navega a una tarjeta concreta
function goTo(idx: number) {
  track.scrollTo({ left: cards[idx].offsetLeft, behavior: "smooth" });
  setActiveIdx(idx);
}
```

#### Controles de navegación

```
←    ●  ●  ●  ○  ○    →
     ↑ dots              ↑ deshabilitado al llegar al final
```

- **Flechas ←/→**: navegan una tarjeta a la vez; se deshabilitan en los extremos (`atStart` / `atEnd`)
- **Dots**: uno por producto; el activo se expande de `w-2` a `w-6`; clic directo para ir a esa posición
- Se ocultan ambos controles si solo hay 1 producto

#### Integración en `app/page.tsx`

```diff
- import { ShopItem } from "@/components/cafe/ShopItem";
+ import { ProductCarousel } from "@/components/cafe/ProductCarousel";

- <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
-   {products.map((p, i) => (
-     <div key={p.id} className="animate-entry" style={{ animationDelay: `${i * 80}ms` }}>
-       <ShopItem product={p} />
-     </div>
-   ))}
- </div>
+ <ProductCarousel products={products} />
```

La descripción de la sección tienda también fue actualizada de "Tres perfiles para empezar" a "Micro-lotes de altura" para reflejar que el número de productos es dinámico.

#### Estado vacío

Si la API devuelve 0 productos, el carrusel muestra:

```
Próximamente — estamos preparando la tienda.
```

---

## 15. Árbol de archivos final

```
cafe_del_rey/
│
├── api/                              ← 🆕 Servicio FastAPI
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env / .env.example
│   ├── main.py
│   ├── database.py
│   ├── models.py                     ← ✏️  + create/update/delete_product
│   ├── schemas.py                    ← ✏️  + ProductCreate
│   ├── auth.py
│   ├── seed.py
│   └── routes/
│       ├── __init__.py
│       ├── auth.py
│       └── products.py               ← ✏️  + POST, PUT, DELETE /products
│
├── app/
│   ├── page.tsx                      ← ✏️  Suspense + ProductCarousel
│   ├── layout.tsx
│   ├── providers.tsx
│   ├── api/
│   │   └── uploads/[...path]/
│   │       └── route.ts              ← 🆕 Proxy de imágenes (evita IP privada)
│   ├── actions/
│   │   ├── preferences.ts
│   │   └── admin.ts                  ← ✏️  + create/update/deleteProductAction
│   └── admin/
│       ├── layout.tsx                ← ✏️  + ToastProvider
│       ├── page.tsx
│       └── login/
│           └── page.tsx
│
├── components/
│   ├── cafe/
│   │   ├── CafeHeader.tsx            ← ✏️  use client, responsive menu, nav limpio
│   │   ├── ShopItem.tsx              ← ✏️  + imageUrl, ProductImage, flex-wrap, touch
│   │   ├── RotateHint.tsx            ← ✏️  returns null
│   │   ├── BagMock.tsx
│   │   ├── ProcessStrip.tsx          ← ✏️  responsive grid
│   │   ├── ProductImage.tsx          ← 🆕 Image real o BagMock fallback
│   │   ├── ShopItemSkeleton.tsx      ← 🆕 Loading skeleton
│   │   └── ProductCarousel.tsx       ← 🆕 Carrusel con scroll-snap
│   └── admin/
│       ├── AdminHeader.tsx           ← ✏️  responsive truncate
│       ├── ProductTable.tsx          ← ✏️  + Editar, Nuevo, Eliminar, modales
│       ├── ImageUploadModal.tsx
│       ├── ProductCreateModal.tsx    ← 🆕 Modal de creación con tallas dinámicas
│       └── ProductEditModal.tsx      ← 🆕 Modal de edición pre-relleno
│
├── design-system/                    (sin cambios)
│   └── components/
│       └── ... (Button, Card, Input, Modal, Toast, etc.)
│
├── styles/
│   ├── globals.css                   ← ✏️  + @keyframes slide-up-fade
│   └── tokens/
│
├── types/
│   └── api.ts                        ← 🆕 ApiProduct + toProxyUrl() + fetchProducts()
│
├── proxy.ts                           ← 🆕 Protección /admin/** (Next.js 16)
├── next.config.ts                     ← ✏️  remotePatterns (localhost:8000)
├── docker-compose.yml                 ← ✏️  + servicio api + volúmenes
├── podman-compose.yml                 ← 🆕 Configuración Podman rootless
├── Makefile                           ← 🆕 Atajos Docker + Podman
├── setup-podman.sh                    ← 🆕 Script de instalación Podman
├── pm2.config.cjs                     ← 🆕 Configuración PM2 (Windows nativo)
└── deploy/windows/
    ├── setup.ps1                      ← 🆕
    ├── start-dev.ps1                  ← 🆕
    ├── start-prod.ps1                 ← 🆕
    └── stop.ps1                       ← 🆕
```

Leyenda: 🆕 creado  ✏️ modificado

---

## 16. Guía de uso rápido

### Levantar el stack

```bash
# Con Docker
docker compose up --build

# Con Podman (Linux/macOS)
podman-compose -f podman-compose.yml up --build

# Con Podman Desktop (Windows)
podman compose up --build

# Solo reconstruir el API (tras cambios Python)
podman compose up --build -d api
```

### URLs

| Servicio | URL |
|---|---|
| Sitio público | http://localhost:4001 |
| Panel admin | http://localhost:4001/admin |
| API — Swagger UI | http://localhost:8000/docs |
| API — lista de productos | http://localhost:8000/products |

### Credenciales de desarrollo

```
Usuario:    superadmin
Contraseña: cafedelrey2025
```

> Cambia estos valores en `api/.env` antes de subir a producción.

### Gestión de productos desde el admin

#### Crear un producto nuevo

1. Ir a `http://localhost:4001/admin` e iniciar sesión
2. Clic en **"+ Nuevo producto"** (arriba a la derecha de la tabla)
3. Completar el formulario:
   - **Nombre** y **origen** (obligatorios)
   - **Descripción corta** (obligatorio)
   - **Proceso** (desplegable: Honey / Lavado / Natural / Anaeróbico / Experimental)
   - **Altura** (opcional)
   - **Tallas**: al menos 1 fila obligatoria, hasta 5 con "+ Agregar talla"
   - **Texto y color del sticker** (opcionales)
   - **Agotado**: checkbox
4. Clic en **"Crear producto"** → toast de éxito → aparece en la tabla

#### Editar un producto

1. En la fila del producto, clic en **"Editar"**
2. El formulario se abre pre-relleno con los datos actuales
3. Modificar los campos deseados y clic en **"Guardar cambios"**
4. Los cambios se reflejan en la tabla y en la landing sin recargar

#### Subir / cambiar la foto

1. En la fila del producto, clic en **"📷"** (sin imagen) o **"Foto"** (con imagen)
2. Seleccionar archivo (JPEG, PNG, WebP o GIF)
3. Verificar el preview → clic en **"Confirmar"**
4. Toast de éxito → la foto aparece en la miniatura y en el carrusel público

#### Eliminar un producto

1. En la fila del producto, clic en **"Eliminar"**
2. El botón cambia a **"Confirmar"** + **"Cancelar"** (2 pasos para evitar borrados accidentales)
3. Clic en **"Confirmar"** → el producto desaparece de la tabla y del carrusel público
4. El archivo de imagen se elimina físicamente del servidor

### Comandos útiles

```bash
# Ver logs en tiempo real
docker compose logs -f
podman compose logs -f

# Shell dentro del contenedor de la API
docker compose exec api bash

# Verificar la API directamente
curl http://localhost:8000/products
curl http://localhost:8000/health

# Resetear volúmenes (borra imágenes y base de datos — ¡destructivo!)
docker compose down -v
podman compose down -v
```

### Flujo de trabajo recomendado en desarrollo

```
1. podman compose up --build    ← primera vez o tras cambios en Python/Dockerfile
2. podman compose up -d         ← arranques normales (reutiliza imagen cacheada)
3. Editar código Next.js        ← hot-reload automático (no requiere reinicio)
4. Editar código Python         ← requiere: podman compose up --build -d api
5. podman compose down          ← al terminar
```

---

*Documentación actualizada el 2026-05-12 · Café del Rey v1.1*
