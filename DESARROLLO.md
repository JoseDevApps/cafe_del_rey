# Café del Rey — Documentación de Desarrollo

> Registro completo de la sesión de mejoras: integración de FastAPI, panel de superadmin, mejoras de UX/UI, migración a Podman y deploy en Windows.

---

## Índice

1. [Punto de partida](#1-punto-de-partida)
2. [Fase 1 — Backend FastAPI](#2-fase-1--backend-fastapi)
3. [Fase 2 — Docker Compose actualizado](#3-fase-2--docker-compose-actualizado)
4. [Fase 3 — Tipos e integración dinámica de productos](#4-fase-3--tipos-e-integración-dinámica-de-productos)
5. [Fase 4 — Skeleton y animaciones](#5-fase-4--skeleton-y-animaciones)
6. [Fase 5 — Middleware de autenticación](#6-fase-5--middleware-de-autenticación)
7. [Fase 6 — Panel de superadmin](#7-fase-6--panel-de-superadmin)
8. [Fase 7 — Mejoras UX/UI](#8-fase-7--mejoras-uxui)
9. [Fase 8 — Migración a Podman](#9-fase-8--migración-a-podman)
10. [Fase 9 — Deploy en Windows](#10-fase-9--deploy-en-windows)
11. [Árbol de archivos final](#11-árbol-de-archivos-final)
12. [Guía de uso rápido](#12-guía-de-uso-rápido)

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
    └── products.py     # GET /products  POST/DELETE /products/{id}/image
```

### Esquema de la base de datos

**Tabla `products` (SQLite)**

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | TEXT PK | Ej: `"rey-1"` |
| `name` | TEXT | Nombre del café |
| `note` | TEXT | Descripción corta |
| `origin` | TEXT | Ej: `"Caranavi · Yungas"` |
| `process` | TEXT | Honey / Lavado / Natural |
| `elevation` | TEXT | Ej: `"1,450–1,750 msnm"` |
| `sticker_text` | TEXT | Texto del sticker SVG |
| `sticker_color` | TEXT | Color CSS del sticker |
| `sizes_json` | TEXT | Array de tallas serializado como JSON |
| `sold_out` | INTEGER | 0/1, default 0 |
| `image_filename` | TEXT | Nombre del archivo en `/app/uploads/`, NULL si sin imagen |

> `sizes_json` usa serialización JSON en una columna TEXT (sin tabla de join) porque las tallas no se gestionan desde el admin y son solo 3 productos.

### Endpoints de la API

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/auth/login` | No | `{ username, password }` → `{ access_token }` |
| `GET` | `/products` | No | Lista todos los productos con `image_url` |
| `GET` | `/products/{id}` | No | Producto individual |
| `POST` | `/products/{id}/image` | Bearer JWT | Sube o reemplaza la imagen (`multipart/form-data`) |
| `DELETE` | `/products/{id}/image` | Bearer JWT | Elimina la imagen (producto vuelve al fallback BagMock) |
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

// Mapea ApiProduct → CafeProduct (formato interno del frontend)
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

`ShopSkeletons` renderiza 3 instancias en el mismo grid que los productos reales.

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

Las tarjetas de producto usan `animation-delay` escalonado (`0ms`, `80ms`, `160ms`) para el efecto cascada.

---

## 6. Fase 5 — Middleware de autenticación

**Objetivo:** proteger todas las rutas `/admin/**` en Next.js.

### `middleware.ts` (nuevo, raíz del proyecto)

```typescript
export const config = { matcher: ["/admin/:path*"] };

export function middleware(request: NextRequest) {
  // /admin/login siempre accesible (evita loop)
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get("admin_token")?.value;

  // Sin token → redirige a login
  if (!token) return redirect("/admin/login");

  // Decodifica el payload JWT (sin verificar firma — solo para expiración)
  const payload = JSON.parse(atob(token.split(".")[1]));
  if (payload.exp * 1000 < Date.now()) {
    // Token expirado → borra cookie + redirige
    response.cookies.delete("admin_token");
    return redirect("/admin/login");
  }

  return NextResponse.next();
}
```

> **Nota de seguridad:** el middleware solo verifica la expiración sin la clave secreta (lectura del payload público del JWT). La verificación criptográfica completa ocurre server-side en las Server Actions antes de cada operación sensible.

---

## 7. Fase 6 — Panel de superadmin

**Objetivo:** interfaz web para que el administrador gestione las fotos de productos.

### Archivos del panel admin

```
app/
├── actions/admin.ts        ← Server Actions (lógica de negocio)
└── admin/
    ├── layout.tsx           ← Layout con AdminHeader
    ├── page.tsx             ← Dashboard (Server Component)
    └── login/
        └── page.tsx         ← Formulario de login

components/admin/
├── AdminHeader.tsx          ← Header con botón logout
├── ProductTable.tsx         ← Tabla de productos con miniaturas
└── ImageUploadModal.tsx     ← Modal con file picker + preview
```

### Flujo completo de autenticación admin

```
1. Usuario visita /admin
   └── middleware lee cookie "admin_token"
       ├── no existe → redirect /admin/login
       └── expirado  → borra cookie + redirect /admin/login

2. Usuario completa formulario en /admin/login
   └── form action={loginAction}

3. loginAction (Server Action en app/actions/admin.ts)
   ├── POST http://api:8000/auth/login  (red interna Docker, server-side)
   ├── Si error → retorna { error: "Credenciales incorrectas" }
   └── Si OK    → guarda JWT en cookie httpOnly, maxAge 8h
                  → redirect("/admin")

4. /admin renderiza como Server Component
   ├── fetch http://api:8000/products  (server-side, sin exponer token al cliente)
   └── renderiza <ProductTable initialProducts={...} />

5. ProductTable (Client Component)
   ├── Muestra tabla: nombre | proceso | miniatura | botón
   └── onClick "Subir foto" → abre <ImageUploadModal>

6. ImageUploadModal (Client Component)
   ├── file input → URL.createObjectURL(file) → preview
   ├── onClick "Confirmar" → uploadImageAction(productId, formData)
   │   └── Server Action: POST /products/{id}/image con Bearer token
   │       → actualiza estado local del ProductTable
   │       → toast de éxito con useToast()
   └── onClick "Eliminar" → deleteImageAction(productId)
       → actualiza estado + toast
```

### Por qué Server Actions para el admin

El token JWT **nunca llega al navegador del usuario**:

- Vive en una cookie `httpOnly` (inaccesible desde JavaScript del cliente)
- Las llamadas al API backend se hacen desde el servidor de Next.js
- El cliente solo ve el resultado de la operación (URL de la imagen o error)

---

## 8. Fase 7 — Mejoras UX/UI

**Objetivo:** pulir la experiencia visual usando el design system existente.

### Cambios en `ShopItem.tsx`

| Antes | Después |
|---|---|
| `hover:-translate-y-0.5` | `hover:-translate-y-1` + `hover:shadow-[var(--ui-shadow)]` |
| `transition-transform` | `transition-all duration-300` (incluye sombra) |
| `<BagMock>` directo | `<ProductImage>` (real o fallback) |
| `<details>` sin indicador | `<details>` con `+` / `-` animado |
| Sin clase `group` | Con clase `group` para coordinar hovers futuros |

### Animaciones de entrada de tarjetas

```html
<!-- Cada tarjeta recibe delay escalonado -->
<div class="animate-entry" style="animation-delay: 0ms">   <!-- Rey Miel -->
<div class="animate-entry" style="animation-delay: 80ms">  <!-- Bosque Lavado -->
<div class="animate-entry" style="animation-delay: 160ms"> <!-- Dorada Natural -->
```

La animación `slide-up-fade` usa `cubic-bezier(0.22, 1, 0.36, 1)` (spring suave) y se desactiva automáticamente con `prefers-reduced-motion: reduce`.

---

## 9. Fase 8 — Migración a Podman

**Objetivo:** permitir ejecutar el stack completo con Podman (alternativa open-source y daemonless a Docker).

### ¿Por qué Podman?

| Característica | Docker | Podman |
|---|---|---|
| Daemon | Requiere `dockerd` corriendo | Sin daemon (daemonless) |
| Privilegios | Requiere root o grupo `docker` | Rootless por defecto |
| Compatibilidad OCI | Sí | Sí |
| Systemd integration | Manual | Nativa (Quadlet / generate systemd) |
| CLI | `docker` | `podman` (drop-in replacement) |
| Licencia | Apache 2.0 (Docker Desktop: comercial) | Apache 2.0 |

### Diferencias clave para este proyecto

#### 1. Volúmenes bind-mount en modo rootless

En Docker, el daemon corre como root y accede a cualquier ruta sin problemas.
En Podman rootless, el proceso del contenedor corre como el UID del usuario host,
pero dentro del namespace de usuario. Sin `userns_mode: keep-id`, el contenedor
vería los archivos como `nobody` y no podría escribirlos.

**Solución en `podman-compose.yml`:**
```yaml
frontend:
  userns_mode: "keep-id"   # mapea UID/GID del host al contenedor
  volumes:
    - .:/app:z             # :z relabela el contexto SELinux (Fedora/RHEL)
```

#### 2. SELinux (Fedora, RHEL, CentOS)

En sistemas con SELinux activado, Podman deniega el acceso a archivos del host si no tienen el contexto correcto. El sufijo `:z` en el volumen lo relabela automáticamente.

```yaml
volumes:
  - .:/app:z        # :z  → relabela (compartido entre contenedores)
  # - .:/app:Z      # :Z  → relabela (privado, solo este contenedor)
```

#### 3. Redes internas

`podman-compose` crea una red bridge igual que `docker-compose`. El nombre de servicio `api` se resuelve correctamente dentro del pod. La variable `API_INTERNAL_URL: "http://api:8000"` funciona sin cambios.

#### 4. Comando

```bash
# Docker
docker compose -f docker-compose.yml up --build

# Podman (opción A — Podman >= 4.4 built-in)
podman compose -f podman-compose.yml up --build

# Podman (opción B — podman-compose CLI)
podman-compose -f podman-compose.yml up --build
```

### Archivos creados para Podman

| Archivo | Propósito |
|---|---|
| `podman-compose.yml` | Compose file con ajustes rootless (`userns_mode`, `:z`) |
| `setup-podman.sh` | Script de instalación para Ubuntu, Fedora, Debian, macOS |
| `Makefile` | Atajos `make podman-up`, `make up`, `make logs`, etc. |

### Instalación paso a paso

#### Ubuntu / Debian

```bash
# 1. Instalar Podman
sudo apt-get update && sudo apt-get install -y podman fuse-overlayfs slirp4netns

# 2. Verificar instalación rootless
podman run --rm hello-world

# 3. Instalar podman-compose
pip3 install --user podman-compose

# 4. Levantar el stack
podman-compose -f podman-compose.yml up --build
```

#### Fedora / RHEL

```bash
sudo dnf install -y podman
pip3 install --user podman-compose
podman-compose -f podman-compose.yml up --build
```

#### macOS (Homebrew)

```bash
brew install podman
podman machine init --cpus 2 --memory 4096 --disk-size 20
podman machine start
pip3 install podman-compose
podman-compose -f podman-compose.yml up --build
```

#### Script automático (Linux)

```bash
chmod +x setup-podman.sh
./setup-podman.sh
make podman-up
```

### Diferencias de comportamiento observables

En Podman rootless, los contenedores se ejecutan sin privilegios elevados.
Si ves errores de permisos en el mount del código fuente, verifica:

```bash
# Verificar que subuid/subgid están configurados
cat /etc/subuid   # debe tener: tuUsuario:100000:65536
cat /etc/subgid

# Si no están, agrégalos
echo "$(whoami):100000:65536" | sudo tee -a /etc/subuid /etc/subgid

# Reiniciar la configuración de Podman
podman system migrate
```

---

## 10. Fase 9 — Deploy en Windows

**Objetivo:** ejecutar el stack completo en Windows de dos formas:
- **Con Podman Desktop** (contenedores, misma experiencia que Linux/Mac)
- **Nativo** (Node.js + Python directo, sin contenedores, para desarrollo rápido)

### 10.1 Con Podman Desktop (recomendado)

Podman Desktop en Windows usa **WSL2** como backend y **Docker Compose v5** como
provider de compose. Esto significa que `podman compose` funciona igual que
`docker compose` pero redirigiendo las llamadas de contenedor a Podman.

#### Prerequisitos

```powershell
# Verificar que Podman Desktop está corriendo y la máquina WSL2 activa
podman --version          # debe mostrar 5.x o superior
podman machine list       # debe mostrar "Currently running"
```

#### Levantar el stack

```powershell
cd E:\Trabajos\cafe_del_rey

# Opción A — comando directo
podman compose up --build

# Opción B — especificando el compose file explícitamente
podman compose -f docker-compose.yml up --build

# Opción C — con Makefile (si tienes make instalado)
make up
```

> `podman compose` sin flags usa `docker-compose.yml` por defecto, igual que Docker.

#### Detener el stack

```powershell
podman compose down          # detiene y elimina contenedores
podman compose down -v       # también borra volúmenes (imágenes y DB)
```

#### Diferencias observadas en Windows con Podman Desktop

| Aspecto | Comportamiento |
|---|---|
| `userns_mode: keep-id` | Ignorado — la VM WSL2 ya mapea UIDs correctamente |
| `:z` SELinux label | Ignorado — WSL2 no usa SELinux |
| Red interna `http://api:8000` | Funciona igual que Docker |
| Volúmenes nombrados | Persisten entre reinicios de la VM |
| Build cache | Compartida con Podman, no con Docker Desktop |

Por esto en Windows se recomienda usar `docker-compose.yml` directamente
(en lugar de `podman-compose.yml` que tiene ajustes solo necesarios en Linux).

---

### 10.2 Deploy nativo en Windows (sin contenedores)

Ejecuta FastAPI y Next.js directamente con Python y Node.js del sistema.
Útil cuando no se tiene Podman/Docker o se quiere máxima velocidad de desarrollo.

#### Prerequisitos

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Python | 3.10+ | [python.org](https://python.org) |
| npm | incluido con Node.js | — |

#### Archivos creados para deploy nativo

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
# Abrir PowerShell como usuario normal (NO como administrador)
cd E:\Trabajos\cafe_del_rey

# Permitir scripts PowerShell si es necesario
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Ejecutar setup
.\deploy\windows\setup.ps1
```

El script realiza automáticamente:
1. ✓ Verifica Node.js ≥ 18 y Python ≥ 3.10
2. ✓ Crea `api/.venv` (entorno virtual Python aislado)
3. ✓ Instala `requirements.txt` en el venv
4. ✓ Crea `api/.env` si no existe
5. ✓ Crea directorios `api/uploads/` y `api/data/`
6. ✓ Ejecuta `npm install`
7. ✓ Ejecuta `npm run build` (build de producción)
8. ✓ Instala PM2 globalmente si no está

#### Paso 2A — Modo desarrollo

```powershell
.\deploy\windows\start-dev.ps1
```

Abre **dos ventanas PowerShell**:
- 🟡 **Ventana API** — `uvicorn main:app --reload` en puerto 8000
- 🔵 **Ventana Frontend** — `next dev` en puerto 4001

Los cambios en el código se reflejan automáticamente sin reiniciar.

#### Paso 2B — Modo producción con PM2

```powershell
.\deploy\windows\start-prod.ps1
```

PM2 gestiona ambos procesos como **servicios persistentes**:
- Los procesos sobreviven al cierre de la terminal
- Se reinician automáticamente si fallan
- Los logs se guardan en `logs/`

```powershell
# Comandos PM2 útiles
pm2 list                  # ver estado de ambos servicios
pm2 logs                  # logs en tiempo real
pm2 logs cafe-api         # solo el API
pm2 logs cafe-frontend    # solo el frontend
pm2 monit                 # dashboard interactivo
pm2 restart all           # reiniciar todo
pm2 stop all              # pausar (los procesos siguen en PM2)
.\deploy\windows\stop.ps1 # detener completamente
```

#### Arranque automático con Windows (inicio de sesión)

```powershell
# Generar y ejecutar el comando de registro en Windows Task Scheduler
pm2 startup
# Sigue las instrucciones que imprime (ejecutar el comando que muestra)

# Guardar el estado actual de PM2
pm2 save
```

Después de esto, los servicios arrancan automáticamente al iniciar sesión en Windows.

#### Diferencia clave entre nativo y contenedores

En modo nativo, `API_INTERNAL_URL` es `http://localhost:8000` (mismo host),
mientras que en Docker/Podman es `http://api:8000` (red interna).

El código en `types/api.ts` maneja esto automáticamente:
```typescript
const base = process.env.API_INTERNAL_URL    // Docker: http://api:8000
          ?? process.env.NEXT_PUBLIC_API_URL  // Nativo: http://localhost:8000
          ?? "http://localhost:8000";          // Fallback
```

---

### 10.3 Resumen comparativo de métodos de deploy en Windows

| | Podman Desktop | Nativo (PM2) |
|---|---|---|
| Aislamiento | ✅ Contenedores WSL2 | ❌ Procesos del sistema |
| Velocidad setup | ⚡ Un comando | 🐢 Setup inicial más largo |
| Hot-reload dev | ✅ Con polling | ✅ Nativo |
| Persistencia | ✅ Volúmenes Docker | ✅ Filesystem local |
| Logs centralizados | `podman compose logs` | `pm2 logs` |
| Arranque automático | Podman machine autostart | PM2 startup |
| Requiere Docker/Podman | ✅ Sí | ❌ No |

---

## 11. Árbol de archivos final

```
cafe_del_rey/
│
├── api/                          ← 🆕 Servicio FastAPI
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env / .env.example
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── seed.py
│   └── routes/
│       ├── __init__.py
│       ├── auth.py
│       └── products.py
│
├── app/
│   ├── page.tsx                  ← ✏️  Async Server Component + Suspense
│   ├── layout.tsx
│   ├── providers.tsx
│   ├── actions/
│   │   ├── preferences.ts        (existente)
│   │   └── admin.ts              ← 🆕 Server Actions admin
│   └── admin/                    ← 🆕 Panel de superadmin
│       ├── layout.tsx
│       ├── page.tsx
│       └── login/
│           └── page.tsx
│
├── components/
│   ├── cafe/
│   │   ├── CafeHeader.tsx        (existente)
│   │   ├── ShopItem.tsx          ← ✏️  + imageUrl, ProductImage, hover
│   │   ├── BagMock.tsx           (existente)
│   │   ├── ProcessStrip.tsx      (existente)
│   │   ├── RotateHint.tsx        (existente)
│   │   ├── ProductImage.tsx      ← 🆕 Image real o BagMock fallback
│   │   └── ShopItemSkeleton.tsx  ← 🆕 Loading skeleton
│   ├── admin/                    ← 🆕 Componentes del panel admin
│   │   ├── AdminHeader.tsx
│   │   ├── ProductTable.tsx
│   │   └── ImageUploadModal.tsx
│   └── gd/                       (existente, sin cambios)
│
├── design-system/                (existente, sin cambios)
│   └── components/
│       └── ... (Button, Card, Input, Modal, Toast, etc.)
│
├── styles/
│   ├── globals.css               ← ✏️  + @keyframes slide-up-fade
│   └── tokens/                   (existente, sin cambios)
│
├── types/
│   └── api.ts                    ← 🆕 ApiProduct + fetchProducts()
│
├── middleware.ts                  ← 🆕 Protección /admin/**
├── next.config.ts                 ← ✏️  + remotePatterns
├── docker-compose.yml             ← ✏️  + servicio api + volúmenes
├── podman-compose.yml             ← 🆕 Configuración Podman rootless
├── Makefile                       ← 🆕 Atajos Docker + Podman
├── setup-podman.sh                ← 🆕 Script de instalación Podman
└── Dockerfile.dev                 (existente, sin cambios)
```

Leyenda: 🆕 creado  ✏️ modificado

---

## 11. Guía de uso rápido

### Levantar el stack

```bash
# Con Docker
docker compose up --build

# Con Podman
podman-compose -f podman-compose.yml up --build

# Con Makefile
make up          # Docker
make podman-up   # Podman
```

### URLs

| Servicio | URL |
|---|---|
| Sitio público | http://localhost:4001 |
| Panel admin | http://localhost:4001/admin |
| API — Swagger UI | http://localhost:8000/docs |
| API — productos | http://localhost:8000/products |

### Credenciales de desarrollo

```
Usuario:    superadmin
Contraseña: cafedelrey2025
```

> Cambia estos valores en `api/.env` antes de subir a producción.

### Flujo de gestión de fotos

1. Ir a `http://localhost:4001/admin`
2. Iniciar sesión con las credenciales
3. En la tabla de productos, hacer clic en **"Subir foto"**
4. Seleccionar una imagen (JPEG, PNG, WebP o GIF)
5. Verificar el preview → clic en **"Confirmar"**
6. Toast de éxito → el producto muestra la foto real en el sitio

### Comandos útiles

```bash
# Ver logs en tiempo real
make logs          # Docker
make podman-logs   # Podman

# Shell dentro del contenedor de la API
make shell-api

# Verificar la API directamente
curl http://localhost:8000/products | jq .
curl http://localhost:8000/health

# Resetear volúmenes (borra imágenes y base de datos)
docker compose down -v    # Docker
make podman-reset         # Podman
```

---

*Documentación generada el 2026-05-12 · Café del Rey v1.0*
