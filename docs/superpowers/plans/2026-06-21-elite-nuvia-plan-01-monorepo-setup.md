# ELITE Nuvia — Plan 01: Monorepo Setup

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Crear la estructura completa del monorepo pnpm con apps/web (React+Vite), apps/api (Node+Express), packages/types, y toda la configuracion de TypeScript y TailwindCSS lista para desarrollo.

**Architecture:** pnpm workspaces con tres packages independientes. `@elite/types` es el unico paquete compartido — contiene todos los tipos TypeScript usados tanto por `web` como por `api`. Sin bundler compartido, cada app tiene su propia build config.

**Tech Stack:** pnpm 8 + Node 20 + TypeScript 5.4 + Vite 5 + React 18 + TailwindCSS 3 + ESLint + Prettier

---

### Task 1: Workspace root

**Files:**
- Create: `/Users/user/Desktop/ELITE/package.json`
- Create: `/Users/user/Desktop/ELITE/pnpm-workspace.yaml`
- Create: `/Users/user/Desktop/ELITE/.gitignore`
- Create: `/Users/user/Desktop/ELITE/.nvmrc`

- [ ] **Step 1: Crear package.json raiz**

```bash
cat > /Users/user/Desktop/ELITE/package.json << 'EOF'
{
  "name": "elite-nuvia",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel --filter './apps/*' dev",
    "build": "pnpm --filter '@elite/types' build && pnpm --parallel --filter './apps/*' build",
    "lint": "pnpm --recursive lint",
    "typecheck": "pnpm --recursive typecheck"
  },
  "engines": { "node": ">=20.0.0", "pnpm": ">=8.0.0" }
}
EOF
```

- [ ] **Step 2: Crear pnpm-workspace.yaml**

```bash
cat > /Users/user/Desktop/ELITE/pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF
```

- [ ] **Step 3: Crear .gitignore**

```bash
cat > /Users/user/Desktop/ELITE/.gitignore << 'EOF'
node_modules/
dist/
build/
.env
.env.local
*.local
graphify-out/graph.html
graphify-out/graph.json
graphify-out/GRAPH_REPORT.md
.superpowers/
*.log
.DS_Store
EOF
```

- [ ] **Step 4: Crear .nvmrc**

```bash
echo "20" > /Users/user/Desktop/ELITE/.nvmrc
```

- [ ] **Step 5: Commit**

```bash
cd /Users/user/Desktop/ELITE
git add package.json pnpm-workspace.yaml .gitignore .nvmrc
git commit -m "feat: init monorepo workspace root"
```

---

### Task 2: Package @elite/types

**Files:**
- Create: `/Users/user/Desktop/ELITE/packages/types/package.json`
- Create: `/Users/user/Desktop/ELITE/packages/types/tsconfig.json`
- Create: `/Users/user/Desktop/ELITE/packages/types/src/index.ts`

- [ ] **Step 1: Crear estructura de directorios**

```bash
mkdir -p /Users/user/Desktop/ELITE/packages/types/src
```

- [ ] **Step 2: Crear package.json del paquete types**

```bash
cat > /Users/user/Desktop/ELITE/packages/types/package.json << 'EOF'
{
  "name": "@elite/types",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc --noEmit",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.4.5"
  }
}
EOF
```

- [ ] **Step 3: Crear tsconfig.json**

```bash
cat > /Users/user/Desktop/ELITE/packages/types/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
EOF
```

- [ ] **Step 4: Crear src/index.ts con todos los tipos del dominio**

```typescript
// /Users/user/Desktop/ELITE/packages/types/src/index.ts

export type TipoOperacion = 'VENTA' | 'ALQUILER' | 'ANTICRETICO'
export type TipoInmueble = 'CASA' | 'DEPARTAMENTO' | 'GARZONIER' | 'TERRENO' | 'LOCAL' | 'OTRO'
export type Rol = 'SUPER_ADMIN' | 'AGENTE' | 'COORDINADOR'
export type LeadEstado = 'NUEVO' | 'EN_CONTACTO' | 'INTERESADO' | 'NEGOCIACION' | 'CERRADO' | 'PERDIDO'

export interface Foto {
  id: string
  url: string
  urlThumb: string
  orden: number
  propiedadId: string
}

export interface AgentePublico {
  id: string
  slug: string
  nombre: string
  apellido: string
  telefono: string
  whatsapp: string
  foto: string | null
  bio: string | null
  propiedadesCount?: number
}

export interface PropiedadPublica {
  id: string
  slug: string
  titulo: string
  descripcion: string
  tipo: TipoOperacion
  tipoInmueble: TipoInmueble
  precio: number
  moneda: string
  ciudad: string
  zona: string | null
  direccion: string | null
  dormitorios: number | null
  banos: number | null
  superficieM2: number | null
  garage: boolean
  amueblado: boolean
  piscina: boolean
  destacada: boolean
  fotos: Foto[]
  agente: AgentePublico
  createdAt: string
}

export interface TestimonioPublico {
  id: string
  nombre: string
  ciudad: string
  texto: string
  rating: number
  tipo: TipoOperacion
  foto: string | null
}

export interface PropiedadesCount {
  venta: number
  alquiler: number
  anticretico: number
  total: number
}

export interface PropiedadesListResponse {
  data: PropiedadPublica[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PropiedadesFilter {
  tipo?: TipoOperacion
  tipoInmueble?: TipoInmueble
  ciudad?: string
  precioMin?: number
  precioMax?: number
  dormitorios?: number
  banos?: number
  garage?: boolean
  amueblado?: boolean
  piscina?: boolean
  page?: number
  pageSize?: number
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
}

export interface AuthPayload {
  userId: string
  rol: Rol
  nombre: string
}
```

- [ ] **Step 5: Instalar deps del paquete types**

```bash
cd /Users/user/Desktop/ELITE
pnpm install
```

Expected output: `Lockfile is up to date, resolution step is skipped`

- [ ] **Step 6: Verificar tipos**

```bash
cd /Users/user/Desktop/ELITE/packages/types
pnpm typecheck
```

Expected: sin errores

- [ ] **Step 7: Commit**

```bash
cd /Users/user/Desktop/ELITE
git add packages/
git commit -m "feat: add @elite/types shared package with domain types"
```

---

### Task 3: App web (React + Vite)

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/index.html`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/.env.example`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/index.css`
- Create: `apps/web/src/lib/utils.ts`
- Create: `apps/web/src/lib/api.ts`

- [ ] **Step 1: Crear estructura de directorios**

```bash
mkdir -p /Users/user/Desktop/ELITE/apps/web/src/{components/{layout,ui,home},hooks,lib,pages}
```

- [ ] **Step 2: Crear package.json de apps/web**

```bash
cat > /Users/user/Desktop/ELITE/apps/web/package.json << 'EOF'
{
  "name": "@elite/web",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 3000",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@elite/types": "workspace:*",
    "@react-three/drei": "^9.105.6",
    "@react-three/fiber": "^8.16.8",
    "framer-motion": "^11.2.10",
    "leaflet": "^1.9.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-leaflet": "^4.2.1",
    "react-router-dom": "^6.23.1",
    "three": "^0.165.0"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.12",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.165.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.4.5",
    "vite": "^5.3.1"
  }
}
EOF
```

- [ ] **Step 3: Crear index.html con Google Fonts**

```html
<!-- /Users/user/Desktop/ELITE/apps/web/index.html -->
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
    <title>ELITE Nuvia — Tu Hogar, Nuestra Pasion</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Crear vite.config.ts**

```typescript
// /Users/user/Desktop/ELITE/apps/web/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
```

- [ ] **Step 5: Crear tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 6: Crear tailwind.config.ts**

```typescript
// /Users/user/Desktop/ELITE/apps/web/tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        'green-deep': '#0A2416',
        'green-main': '#0D3B27',
        'green-mid': '#1a5c3a',
        'gold': '#C9A84C',
        'gold-light': '#E8C96A',
        'cream': '#F5F0E6',
        'cream-dark': '#EDE8DC',
        'text-dark': '#111810',
        'text-mid': '#4a5240',
        'text-muted': '#8a9080',
      },
      maxWidth: {
        'content': '1366px',
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 7: Crear postcss.config.js**

```javascript
// /Users/user/Desktop/ELITE/apps/web/postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 8: Crear src/index.css con tokens y liquid-glass**

```css
/* /Users/user/Desktop/ELITE/apps/web/src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700;800&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --green-deep:  #0A2416;
  --green-main:  #0D3B27;
  --green-mid:   #1a5c3a;
  --gold:        #C9A84C;
  --gold-light:  #E8C96A;
  --cream:       #F5F0E6;
  --cream-dark:  #EDE8DC;
  --text-dark:   #111810;
  --text-mid:    #4a5240;
  --text-muted:  #8a9080;
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   18px;
}

* { box-sizing: border-box; }

body {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #080e09;
  color: #fff;
  margin: 0;
}

/* Container — 1224px de contenido centrado */
.wrap {
  width: 100%;
  max-width: 1366px;
  margin: 0 auto;
  padding: 0 71px;
}

@media (max-width: 768px) {
  .wrap { padding: 0 20px; }
}

/* Liquid Glass */
.liquid-glass {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}
.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.3) 0%,
    rgba(255,255,255,0.1) 20%,
    rgba(255,255,255,0) 40%,
    rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.1) 80%,
    rgba(255,255,255,0.3) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* Leaflet CSS fix */
.leaflet-container { z-index: 1; }
```

- [ ] **Step 9: Crear src/lib/utils.ts**

```typescript
// /Users/user/Desktop/ELITE/apps/web/src/lib/utils.ts
import type { TipoOperacion } from '@elite/types'

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatPrice(price: number, moneda = 'BOB'): string {
  if (moneda === 'BOB') {
    return `Bs. ${price.toLocaleString('es-BO')}`
  }
  return `$us. ${price.toLocaleString('es-BO')}`
}

export function isNew(createdAt: string, days = 7): boolean {
  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays <= days
}

export function badgeConfig(tipo: TipoOperacion) {
  const configs = {
    VENTA: { label: 'Venta', className: 'bg-gold text-green-deep' },
    ALQUILER: { label: 'Alquiler', className: 'border border-gold text-gold bg-green-deep' },
    ANTICRETICO: { label: 'Anticretico', className: 'bg-white/10 backdrop-blur text-white border border-white/30' },
  }
  return configs[tipo]
}

export function whatsappUrl(number: string, message?: string): string {
  const clean = number.replace(/\D/g, '')
  const msg = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${clean}${msg}`
}
```

- [ ] **Step 10: Crear src/lib/api.ts**

```typescript
// /Users/user/Desktop/ELITE/apps/web/src/lib/api.ts
import type {
  PropiedadPublica, PropiedadesListResponse, PropiedadesFilter,
  PropiedadesCount, AgentePublico, TestimonioPublico
} from '@elite/types'

const BASE = import.meta.env.VITE_API_URL ?? ''

async function get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export const api = {
  propiedades: {
    list: (filter?: PropiedadesFilter) =>
      get<PropiedadesListResponse>('/api/v1/propiedades', filter as Record<string, string | number | boolean>),
    destacadas: () =>
      get<PropiedadPublica[]>('/api/v1/propiedades/destacadas'),
    count: () =>
      get<PropiedadesCount>('/api/v1/propiedades/count'),
    bySlug: (slug: string) =>
      get<PropiedadPublica>(`/api/v1/propiedades/${slug}`),
  },
  agentes: {
    list: () =>
      get<AgentePublico[]>('/api/v1/agentes'),
    bySlug: (slug: string) =>
      get<AgentePublico & { propiedades: PropiedadPublica[] }>(`/api/v1/agentes/${slug}`),
  },
  testimonios: {
    list: () =>
      get<TestimonioPublico[]>('/api/v1/testimonios'),
  },
}
```

- [ ] **Step 11: Crear src/main.tsx**

```tsx
// /Users/user/Desktop/ELITE/apps/web/src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
```

- [ ] **Step 12: Crear src/App.tsx con rutas**

```tsx
// /Users/user/Desktop/ELITE/apps/web/src/App.tsx
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import PropiedadesPage from './pages/PropiedadesPage'
import PropiedadDetailPage from './pages/PropiedadDetailPage'
import AgentePage from './pages/AgentePage'
import ServiciosPage from './pages/ServiciosPage'
import NosotrosPage from './pages/NosotrosPage'
import ContactoPage from './pages/ContactoPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/propiedades" element={<PropiedadesPage />} />
        <Route path="/propiedades/:slug" element={<PropiedadDetailPage />} />
        <Route path="/agentes/:slug" element={<AgentePage />} />
        <Route path="/servicios" element={<ServiciosPage />} />
        <Route path="/nosotros" element={<NosotrosPage />} />
        <Route path="/contacto" element={<ContactoPage />} />
      </Route>
    </Routes>
  )
}
```

- [ ] **Step 13: Crear placeholders de paginas**

```bash
for page in HomePage PropiedadesPage PropiedadDetailPage AgentePage ServiciosPage NosotrosPage ContactoPage; do
cat > /Users/user/Desktop/ELITE/apps/web/src/pages/${page}.tsx << EOF
export default function ${page}() {
  return <div className="min-h-screen flex items-center justify-center text-gold">${page}</div>
}
EOF
done
```

- [ ] **Step 14: Crear tsconfig.node.json**

```bash
cat > /Users/user/Desktop/ELITE/apps/web/tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
EOF
```

- [ ] **Step 15: Crear .env.example**

```bash
cat > /Users/user/Desktop/ELITE/apps/web/.env.example << 'EOF'
VITE_API_URL=http://localhost:8080
VITE_WA_NUMBER=59170000000
EOF
cp /Users/user/Desktop/ELITE/apps/web/.env.example /Users/user/Desktop/ELITE/apps/web/.env
```

- [ ] **Step 16: Instalar dependencias y verificar arranque**

```bash
cd /Users/user/Desktop/ELITE
pnpm install
cd apps/web
pnpm dev
```

Expected: `VITE v5.x.x  ready in XXX ms` + `http://localhost:3000/`  
Abrir el browser y verificar que carga sin errores de consola.

- [ ] **Step 17: Commit**

```bash
cd /Users/user/Desktop/ELITE
git add apps/web/
git commit -m "feat: scaffold React+Vite web app with TailwindCSS and routing"
```

---

### Task 4: App api (Node + Express estructura base)

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/.env.example`
- Create: `apps/api/src/index.ts`
- Create: `apps/api/src/app.ts`
- Create: `apps/api/src/lib/prisma.ts`
- Create: `apps/api/src/middleware/errorHandler.ts`

- [ ] **Step 1: Crear estructura de directorios**

```bash
mkdir -p /Users/user/Desktop/ELITE/apps/api/src/{middleware,routes,lib}
mkdir -p /Users/user/Desktop/ELITE/apps/api/prisma
```

- [ ] **Step 2: Crear package.json de apps/api**

```bash
cat > /Users/user/Desktop/ELITE/apps/api/package.json << 'EOF'
{
  "name": "@elite/api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@elite/types": "workspace:*",
    "@prisma/client": "^5.15.0",
    "bcryptjs": "^2.4.3",
    "cloudinary": "^2.3.0",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "express": "^5.0.0",
    "express-rate-limit": "^7.3.1",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "puppeteer": "^22.11.2",
    "qrcode": "^1.5.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie-parser": "^1.4.7",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.14.9",
    "@types/qrcode": "^1.5.5",
    "prisma": "^5.15.0",
    "tsx": "^4.16.0",
    "typescript": "^5.4.5"
  }
}
EOF
```

- [ ] **Step 3: Crear tsconfig.json**

```bash
cat > /Users/user/Desktop/ELITE/apps/api/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["src", "prisma"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

- [ ] **Step 4: Crear .env.example**

```bash
cat > /Users/user/Desktop/ELITE/apps/api/.env.example << 'EOF'
DATABASE_URL="postgresql://elite:password@localhost:5432/elite_nuvia"
JWT_SECRET="change-me-min-32-chars-random-string-here"
JWT_REFRESH_SECRET="change-me-refresh-min-32-chars-random"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
PORT=8080
NODE_ENV=development
EOF
cp /Users/user/Desktop/ELITE/apps/api/.env.example /Users/user/Desktop/ELITE/apps/api/.env
```

- [ ] **Step 5: Crear src/lib/prisma.ts**

```typescript
// /Users/user/Desktop/ELITE/apps/api/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 6: Crear src/middleware/errorHandler.ts**

```typescript
// /Users/user/Desktop/ELITE/apps/api/src/middleware/errorHandler.ts
import type { Request, Response, NextFunction } from 'express'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal Server Error', message: err.message, statusCode: 500 })
}
```

- [ ] **Step 7: Crear src/app.ts**

```typescript
// /Users/user/Desktop/ELITE/apps/api/src/app.ts
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://elitenuvia.bo']
      : ['http://localhost:3000'],
    credentials: true,
  }))
  app.use(express.json())
  app.use(cookieParser())

  app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok', ts: new Date().toISOString() })
  })

  app.use(errorHandler)
  return app
}
```

- [ ] **Step 8: Crear src/index.ts**

```typescript
// /Users/user/Desktop/ELITE/apps/api/src/index.ts
import { createApp } from './app.js'

const PORT = Number(process.env.PORT ?? 8080)

const app = createApp()

app.listen(PORT, () => {
  console.log(`ELITE Nuvia API running on http://localhost:${PORT}`)
})
```

- [ ] **Step 9: Instalar deps y verificar arranque**

```bash
cd /Users/user/Desktop/ELITE
pnpm install
cd apps/api
pnpm dev
```

Expected:
```
ELITE Nuvia API running on http://localhost:8080
```

```bash
curl http://localhost:8080/api/v1/health
```

Expected: `{"status":"ok","ts":"..."}`

- [ ] **Step 10: Commit**

```bash
cd /Users/user/Desktop/ELITE
git add apps/api/
git commit -m "feat: scaffold Node/Express API app with Prisma client and error handler"
```
