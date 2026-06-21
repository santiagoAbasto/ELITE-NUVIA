# ELITE Nuvia — Plan de Implementacion: Overview

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el sitio publico de ELITE Nuvia — React + Framer Motion + Three.js — mas el backend Node/Express + Prisma + PostgreSQL, sirviendo ambos desde un servidor unico en puerto 8080 con el CRM Angular oculto en `/ELITE-CRM/ADMIN/`.

**Architecture:** Monorepo pnpm con tres apps (`web`, `api`, `crm`) y un paquete compartido (`types`). Express sirve el build estatico de React en `/`, el build de Angular en `/ELITE-CRM/ADMIN/`, y la API REST en `/api/v1/`. JWT en httpOnly cookies protege todas las rutas del CRM. El CRM no tiene ningun link visible desde el sitio publico y esta excluido de robots.txt y sitemap.

**Tech Stack:** React 18 + Vite + TypeScript + TailwindCSS + Framer Motion 11 + Three.js (@react-three/fiber) + Leaflet.js | Node.js 20 + Express 5 + Prisma 5 + PostgreSQL 16 + Puppeteer + Cloudinary + JWT

---

## Diagramas de Arquitectura (Graphify)

Ver carpeta `docs/superpowers/graphs/`:

| Archivo | Contenido |
|---|---|
| `01-arquitectura-general.md` | Vision completa del sistema con todos los subsistemas |
| `02-diagrama-rutas.md` | Mapa de todas las rutas del servidor — publicas vs ocultas |
| `03-flujo-login-crm.md` | Sequence diagram del proceso de autenticacion JWT |
| `04-flujo-propiedades.md` | Flujo de propiedad desde CRM hasta sitio publico + PDF |
| `05-modelo-datos.md` | ER diagram completo con todas las entidades y relaciones |
| `06-flujo-pdf.md` | Proceso de generacion de PDF con Puppeteer |

**Grafo interactivo:** `graphify-out/graph.html` — abrir en browser para explorar las conexiones entre componentes detectadas automaticamente por Graphify.

**God nodes identificados por Graphify** (componentes mas criticos del sistema):
1. `Framer Motion 11` — 12 conexiones, bridge entre todas las secciones animadas
2. `API Node.js/Express` — 9 conexiones, nucleo del sistema
3. `Public API Endpoints` — 9 conexiones, interfaz publica
4. `React Frontend` — 8 conexiones, orquesta toda la experiencia
5. `Prisma ORM` — 7 conexiones, capa de datos

---

## Sub-planes (en orden de ejecucion)

| Plan | Archivo | Fases |
|---|---|---|
| **01** | `plan-01-monorepo-setup.md` | Monorepo pnpm + shared types + Vite config |
| **02** | `plan-02-backend-base.md` | Express + Prisma schema + PostgreSQL + seed |
| **03** | `plan-03-api-publica.md` | Endpoints publicos + tests con supertest |
| **04** | `plan-04-componentes-globales.md` | Layout + Navbar + Footer + FAB + Logo SVG |
| **05** | `plan-05-hero.md` | Hero video + AnimatedHeading + scroll indicator |
| **06** | `plan-06-buscador-mapa.md` | SearchPanel + tabs animados + Leaflet map |
| **07** | `plan-07-propiedades.md` | PropertyCard + grid + stagger animations |
| **08** | `plan-08-servicios-threejs.md` | Three.js particles + service cards 3D flip |
| **09** | `plan-09-stats-agentes-testimonios.md` | Stats counter + draggable carousel + testimonials |
| **10** | `plan-10-scroll-polish-seo.md` | Parallax + cursor + SEO + sitemap + deploy |

---

## Estructura de Directorios Final

```
/ELITE
├── apps/
│   ├── web/                        ← React 18 + Vite (sitio publico)
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── index.css              ← tokens CSS + liquid-glass + .wrap
│   │       ├── components/
│   │       │   ├── layout/
│   │       │   │   ├── Layout.tsx
│   │       │   │   ├── Navbar.tsx
│   │       │   │   ├── Footer.tsx
│   │       │   │   └── WhatsAppFAB.tsx
│   │       │   ├── ui/
│   │       │   │   ├── LogoSVG.tsx
│   │       │   │   ├── AnimatedHeading.tsx
│   │       │   │   ├── FadeIn.tsx
│   │       │   │   ├── SectionEyebrow.tsx
│   │       │   │   └── CustomCursor.tsx
│   │       │   └── home/
│   │       │       ├── HeroSection.tsx
│   │       │       ├── HeroTagCard.tsx
│   │       │       ├── SearchSection.tsx
│   │       │       ├── SearchPanel.tsx
│   │       │       ├── PropertiesSection.tsx
│   │       │       ├── PropertyCard.tsx
│   │       │       ├── ServicesSection.tsx
│   │       │       ├── ParticlesCanvas.tsx
│   │       │       ├── StatsSection.tsx
│   │       │       ├── AgentsSection.tsx
│   │       │       ├── AgentCard.tsx
│   │       │       ├── TestimonialsSection.tsx
│   │       │       └── TestimonioCard.tsx
│   │       ├── hooks/
│   │       │   ├── useCountUp.ts
│   │       │   ├── useProperties.ts
│   │       │   ├── useAgentes.ts
│   │       │   └── useTestimonios.ts
│   │       ├── lib/
│   │       │   ├── api.ts             ← fetch wrapper con base URL
│   │       │   └── utils.ts           ← cn(), formatPrice(), isNew()
│   │       └── pages/
│   │           ├── HomePage.tsx
│   │           ├── PropiedadesPage.tsx
│   │           ├── PropiedadDetailPage.tsx
│   │           ├── AgentePage.tsx
│   │           ├── ServiciosPage.tsx
│   │           ├── NosotrosPage.tsx
│   │           └── ContactoPage.tsx
│   ├── api/                          ← Node.js + Express
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── index.ts              ← server entry (serves web + crm + api)
│   │       ├── app.ts                ← express app
│   │       ├── middleware/
│   │       │   ├── rateLimiter.ts
│   │       │   ├── auth.ts           ← verifyJWT middleware
│   │       │   └── errorHandler.ts
│   │       ├── routes/
│   │       │   ├── propiedades.ts
│   │       │   ├── agentes.ts
│   │       │   ├── testimonios.ts
│   │       │   ├── auth.ts
│   │       │   └── sitemap.ts
│   │       └── lib/
│   │           ├── prisma.ts         ← singleton PrismaClient
│   │           └── pdf.ts            ← Puppeteer PDF generator
│   └── crm/                          ← Angular 17 (spec separado)
├── packages/
│   └── types/
│       ├── package.json
│       └── src/index.ts              ← tipos compartidos
├── package.json                      ← pnpm workspace root
├── pnpm-workspace.yaml
├── .gitignore
└── docs/
    └── superpowers/
        ├── specs/
        ├── plans/
        └── graphs/                   ← diagramas Graphify + Mermaid
```

---

## Variables de Entorno

### `apps/api/.env`
```env
DATABASE_URL="postgresql://elite:password@localhost:5432/elite_nuvia"
JWT_SECRET="change-me-min-32-chars-random"
JWT_REFRESH_SECRET="change-me-refresh-min-32-chars"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
PORT=8080
NODE_ENV=development
```

### `apps/web/.env`
```env
VITE_API_URL=http://localhost:8080
VITE_WA_NUMBER=59170000000
```

---

## Prerequisitos

```bash
# Herramientas requeridas
node --version    # >= 20.0.0
pnpm --version    # >= 8.0.0
psql --version    # PostgreSQL 16

# Instalar pnpm si no esta
npm install -g pnpm

# Crear base de datos
createdb elite_nuvia
```
