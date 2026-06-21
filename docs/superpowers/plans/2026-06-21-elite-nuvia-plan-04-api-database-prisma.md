# ELITE Nuvia — Plan 04: API + Base de Datos + Prisma

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Definir el schema Prisma completo, correr migraciones en PostgreSQL, cargar datos seed realistas, e implementar todos los endpoints publicos de la API con tests supertest.

**Architecture:** Prisma como unica capa de acceso a datos. Schema en `apps/api/prisma/schema.prisma`. Seeds en `apps/api/prisma/seed.ts`. Rutas Express en `apps/api/src/routes/`. Ver `docs/superpowers/graphs/05-modelo-datos.md` para el ER diagram completo.

**Tech Stack:** Prisma 5 + PostgreSQL 16 + Express 5 + supertest (tests)

---

## Referencia: Modelo de Datos

Ver diagrama ER completo en: `docs/superpowers/graphs/05-modelo-datos.md`

Entidades principales: `User`, `Agente`, `Propiedad`, `Foto`, `Testimonio`, `Lead`, `PdfExport`  
Enums: `TipoOperacion`, `TipoInmueble`, `Rol`, `LeadEstado`

---

### Task 1: Prisma Schema

**Files:**
- Create: `apps/api/prisma/schema.prisma`

- [ ] **Step 1: Crear schema.prisma**

```prisma
// /Users/user/Desktop/ELITE/apps/api/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum TipoOperacion {
  VENTA
  ALQUILER
  ANTICRETICO
}

enum TipoInmueble {
  CASA
  DEPARTAMENTO
  GARZONIER
  TERRENO
  LOCAL
  OTRO
}

enum Rol {
  SUPER_ADMIN
  AGENTE
  COORDINADOR
}

enum LeadEstado {
  NUEVO
  EN_CONTACTO
  INTERESADO
  NEGOCIACION
  CERRADO
  PERDIDO
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  rol       Rol
  activo    Boolean  @default(true)
  agenteId  String?  @unique
  agente    Agente?  @relation(fields: [agenteId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Agente {
  id          String      @id @default(cuid())
  slug        String      @unique
  nombre      String
  apellido    String
  email       String      @unique
  telefono    String
  whatsapp    String
  foto        String?
  bio         String?
  activo      Boolean     @default(true)
  propiedades Propiedad[]
  leads       Lead[]
  pdfExports  PdfExport[]
  user        User?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@map("agentes")
}

model Propiedad {
  id            String        @id @default(cuid())
  slug          String        @unique
  titulo        String
  descripcion   String
  tipo          TipoOperacion
  tipoInmueble  TipoInmueble
  precio        Decimal       @db.Decimal(12, 2)
  moneda        String        @default("BOB")
  ciudad        String
  zona          String?
  direccion     String?
  latitud       Float?
  longitud      Float?
  dormitorios   Int?
  banos         Int?
  superficieM2  Decimal?      @db.Decimal(10, 2)
  garage        Boolean       @default(false)
  amueblado     Boolean       @default(false)
  piscina       Boolean       @default(false)
  destacada     Boolean       @default(false)
  activa        Boolean       @default(true)
  agenteId      String
  agente        Agente        @relation(fields: [agenteId], references: [id])
  fotos         Foto[]
  leads         Lead[]
  pdfExports    PdfExport[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([tipo, activa])
  @@index([ciudad, activa])
  @@index([destacada, activa])
  @@map("propiedades")
}

model Foto {
  id          String    @id @default(cuid())
  url         String
  urlThumb    String
  orden       Int       @default(0)
  propiedadId String
  propiedad   Propiedad @relation(fields: [propiedadId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())

  @@index([propiedadId, orden])
  @@map("fotos")
}

model Testimonio {
  id        String        @id @default(cuid())
  nombre    String
  ciudad    String
  texto     String
  rating    Int           @default(5)
  tipo      TipoOperacion
  foto      String?
  activo    Boolean       @default(true)
  createdAt DateTime      @default(now())

  @@map("testimonios")
}

model Lead {
  id          String     @id @default(cuid())
  nombre      String
  email       String?
  telefono    String
  mensaje     String?
  estado      LeadEstado @default(NUEVO)
  propiedadId String?
  propiedad   Propiedad? @relation(fields: [propiedadId], references: [id])
  agenteId    String?
  agente      Agente?    @relation(fields: [agenteId], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@map("leads")
}

model PdfExport {
  id          String    @id @default(cuid())
  propiedadId String
  propiedad   Propiedad @relation(fields: [propiedadId], references: [id])
  agenteId    String
  agente      Agente    @relation(fields: [agenteId], references: [id])
  generadoAt  DateTime  @default(now())

  @@map("pdf_exports")
}
```

- [ ] **Step 2: Verificar que PostgreSQL esta corriendo**

```bash
psql -c "SELECT version();" postgres
```

Expected: `PostgreSQL 16.x on ...`

- [ ] **Step 3: Crear base de datos**

```bash
createdb elite_nuvia 2>/dev/null || echo "DB ya existe"
psql -c "CREATE USER elite WITH PASSWORD 'password';" postgres 2>/dev/null || echo "User ya existe"
psql -c "GRANT ALL PRIVILEGES ON DATABASE elite_nuvia TO elite;" postgres
```

- [ ] **Step 4: Correr migracion inicial**

```bash
cd /Users/user/Desktop/ELITE/apps/api
pnpm db:generate
pnpm db:migrate
```

Al prompt `Enter a name for the new migration:` escribir: `init`

Expected:
```
Your database is now in sync with your schema.
Generated Prisma Client (v5.x)
```

- [ ] **Step 5: Commit**

```bash
cd /Users/user/Desktop/ELITE
git add apps/api/prisma/
git commit -m "feat: add Prisma schema with all domain models and initial migration"
```

---

### Task 2: Seed data

**Files:**
- Create: `apps/api/prisma/seed.ts`

- [ ] **Step 1: Crear seed.ts con datos realistas**

```typescript
// /Users/user/Desktop/ELITE/apps/api/prisma/seed.ts
import { PrismaClient, TipoOperacion, TipoInmueble, Rol } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding ELITE Nuvia database...')

  // Agentes
  const agenteLitzi = await prisma.agente.upsert({
    where: { slug: 'litzi-barbeito' },
    update: {},
    create: {
      slug: 'litzi-barbeito',
      nombre: 'Litzi',
      apellido: 'Barbeito',
      email: 'litzi@elitenuvia.bo',
      telefono: '+591 70000001',
      whatsapp: '59170000001',
      foto: null,
      bio: 'Asesora inmobiliaria con 5 anos de experiencia en Cochabamba. Especialista en venta de casas residenciales.',
      activo: true,
    },
  })

  const agenteVanessa = await prisma.agente.upsert({
    where: { slug: 'vanessa-escalera' },
    update: {},
    create: {
      slug: 'vanessa-escalera',
      nombre: 'Vanessa',
      apellido: 'Escalera',
      email: 'vanessa@elitenuvia.bo',
      telefono: '+591 70000002',
      whatsapp: '59170000002',
      foto: null,
      bio: 'Especialista en alquiler de garzoniers y departamentos de lujo en Cochabamba.',
      activo: true,
    },
  })

  // Super Admin user
  const hash = await bcrypt.hash('Admin123!', 12)
  await prisma.user.upsert({
    where: { email: 'admin@elitenuvia.bo' },
    update: {},
    create: {
      email: 'admin@elitenuvia.bo',
      password: hash,
      rol: Rol.SUPER_ADMIN,
      activo: true,
    },
  })

  // User para Litzi
  const hashAgente = await bcrypt.hash('Litzi123!', 12)
  await prisma.user.upsert({
    where: { email: 'litzi@elitenuvia.bo' },
    update: {},
    create: {
      email: 'litzi@elitenuvia.bo',
      password: hashAgente,
      rol: Rol.AGENTE,
      agenteId: agenteLitzi.id,
      activo: true,
    },
  })

  // Propiedades
  const prop1 = await prisma.propiedad.upsert({
    where: { slug: 'casa-av-sucre-quillacollo' },
    update: {},
    create: {
      slug: 'casa-av-sucre-quillacollo',
      titulo: 'Casa en Av. Sucre, Quillacollo',
      descripcion: 'Hermosa casa de 3 plantas en zona residencial de Quillacollo. Amplio jardin, cochera doble, acabados de primera calidad. Ideal para familia grande.',
      tipo: TipoOperacion.VENTA,
      tipoInmueble: TipoInmueble.CASA,
      precio: 380000,
      moneda: 'BOB',
      ciudad: 'Cochabamba',
      zona: 'Quillacollo',
      dormitorios: 3,
      banos: 2,
      superficieM2: 180,
      garage: true,
      amueblado: false,
      piscina: false,
      destacada: true,
      activa: true,
      agenteId: agenteLitzi.id,
    },
  })

  const prop2 = await prisma.propiedad.upsert({
    where: { slug: 'garzonier-lujo-golden-park' },
    update: {},
    create: {
      slug: 'garzonier-lujo-golden-park',
      titulo: 'Garzonier de Lujo — Golden Park',
      descripcion: 'Exquisito garzonier completamente amueblado con vista panoramica. Edificio Golden Park con areas sociales premium, seguridad 24/7 y parqueo.',
      tipo: TipoOperacion.ALQUILER,
      tipoInmueble: TipoInmueble.GARZONIER,
      precio: 4200,
      moneda: 'BOB',
      ciudad: 'Cochabamba',
      zona: 'Zona Norte',
      dormitorios: 1,
      banos: 1,
      superficieM2: 52,
      garage: true,
      amueblado: true,
      piscina: false,
      destacada: true,
      activa: true,
      agenteId: agenteVanessa.id,
    },
  })

  const prop3 = await prisma.propiedad.upsert({
    where: { slug: 'departamento-anticretico-zona-norte' },
    update: {},
    create: {
      slug: 'departamento-anticretico-zona-norte',
      titulo: 'Departamento en Anticretico — Zona Norte',
      descripcion: 'Moderno departamento en planta baja con terraza privada. Anticretico por 2 anos, monto completamente recuperable al finalizar el contrato.',
      tipo: TipoOperacion.ANTICRETICO,
      tipoInmueble: TipoInmueble.DEPARTAMENTO,
      precio: 85000,
      moneda: 'BOB',
      ciudad: 'Cochabamba',
      zona: 'Zona Norte',
      dormitorios: 2,
      banos: 1,
      superficieM2: 75,
      garage: false,
      amueblado: false,
      piscina: false,
      destacada: true,
      activa: true,
      agenteId: agenteLitzi.id,
    },
  })

  // Fotos placeholder (Cloudinary URLs se actualizan desde el CRM)
  await prisma.foto.createMany({
    skipDuplicates: true,
    data: [
      { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', urlThumb: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_400/sample.jpg', orden: 0, propiedadId: prop1.id },
      { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', urlThumb: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_400/sample.jpg', orden: 0, propiedadId: prop2.id },
      { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', urlThumb: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_400/sample.jpg', orden: 0, propiedadId: prop3.id },
    ],
  })

  // Testimonios
  await prisma.testimonio.createMany({
    skipDuplicates: false,
    data: [
      { nombre: 'Maria Paula Vargas', ciudad: 'Cochabamba', texto: 'Gracias al equipo de ELITE Nuvia encontramos nuestra casa sonada en menos de un mes. Litzi fue increible, nos guio en cada paso del proceso y siempre estuvo disponible.', rating: 5, tipo: TipoOperacion.VENTA, activo: true },
      { nombre: 'Carlos Mendoza', ciudad: 'Quillacollo', texto: 'Excelente servicio profesional. Vanessa nos ayudo a encontrar el garzonier perfecto en tiempo record. Sin duda los recomendaria a cualquier persona.', rating: 5, tipo: TipoOperacion.ALQUILER, activo: true },
      { nombre: 'Ana Rodriguez', ciudad: 'Tiquipaya', texto: 'El proceso de anticretico con ELITE Nuvia fue muy transparente. Nos explicaron todo en detalle y el contrato fue claro desde el principio.', rating: 5, tipo: TipoOperacion.ANTICRETICO, activo: true },
    ],
  })

  console.log('Seed completado.')
  console.log(`Agentes: 2 | Propiedades: 3 | Testimonios: 3`)
  console.log(`Admin login: admin@elitenuvia.bo / Admin123!`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

- [ ] **Step 2: Correr seed**

```bash
cd /Users/user/Desktop/ELITE/apps/api
pnpm db:seed
```

Expected:
```
Seed completado.
Agentes: 2 | Propiedades: 3 | Testimonios: 3
Admin login: admin@elitenuvia.bo / Admin123!
```

- [ ] **Step 3: Verificar datos en DB**

```bash
cd /Users/user/Desktop/ELITE/apps/api
pnpm db:studio
```

Verificar en el browser (http://localhost:5555) que existen las 3 propiedades, 2 agentes y 3 testimonios.

- [ ] **Step 4: Commit**

```bash
cd /Users/user/Desktop/ELITE
git add apps/api/prisma/seed.ts
git commit -m "feat: add database seed with realistic ELITE Nuvia data"
```

---

### Task 3: Endpoints publicos — Propiedades

**Files:**
- Create: `apps/api/src/routes/propiedades.ts`
- Modify: `apps/api/src/app.ts`

- [ ] **Step 1: Crear routes/propiedades.ts**

```typescript
// /Users/user/Desktop/ELITE/apps/api/src/routes/propiedades.ts
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import type { PropiedadesFilter } from '@elite/types'

export const propiedadesRouter = Router()

// GET /api/v1/propiedades/count
propiedadesRouter.get('/count', async (_req, res, next) => {
  try {
    const [venta, alquiler, anticretico] = await Promise.all([
      prisma.propiedad.count({ where: { tipo: 'VENTA', activa: true } }),
      prisma.propiedad.count({ where: { tipo: 'ALQUILER', activa: true } }),
      prisma.propiedad.count({ where: { tipo: 'ANTICRETICO', activa: true } }),
    ])
    res.setHeader('Cache-Control', 'public, max-age=300')
    res.json({ venta, alquiler, anticretico, total: venta + alquiler + anticretico })
  } catch (err) { next(err) }
})

// GET /api/v1/propiedades/destacadas
propiedadesRouter.get('/destacadas', async (_req, res, next) => {
  try {
    const propiedades = await prisma.propiedad.findMany({
      where: { destacada: true, activa: true },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        fotos: { orderBy: { orden: 'asc' }, take: 4 },
        agente: { select: { id:true, slug:true, nombre:true, apellido:true, telefono:true, whatsapp:true, foto:true } },
      },
    })
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.json(propiedades)
  } catch (err) { next(err) }
})

// GET /api/v1/propiedades
propiedadesRouter.get('/', async (req, res, next) => {
  try {
    const {
      tipo, tipoInmueble, ciudad, precioMin, precioMax,
      dormitorios, banos, garage, amueblado, piscina,
      page = '1', pageSize = '12',
    } = req.query as Record<string, string>

    const where: Record<string, unknown> = { activa: true }
    if (tipo) where.tipo = tipo
    if (tipoInmueble) where.tipoInmueble = tipoInmueble
    if (ciudad) where.ciudad = { contains: ciudad, mode: 'insensitive' }
    if (precioMin || precioMax) where.precio = {
      ...(precioMin ? { gte: Number(precioMin) } : {}),
      ...(precioMax ? { lte: Number(precioMax) } : {}),
    }
    if (dormitorios) where.dormitorios = { gte: Number(dormitorios) }
    if (banos) where.banos = { gte: Number(banos) }
    if (garage === 'true') where.garage = true
    if (amueblado === 'true') where.amueblado = true
    if (piscina === 'true') where.piscina = true

    const pageNum = Math.max(1, Number(page))
    const pageSizeNum = Math.min(50, Math.max(1, Number(pageSize)))
    const skip = (pageNum - 1) * pageSizeNum

    const [data, total] = await Promise.all([
      prisma.propiedad.findMany({
        where,
        skip,
        take: pageSizeNum,
        orderBy: [{ destacada: 'desc' }, { createdAt: 'desc' }],
        include: {
          fotos: { orderBy: { orden: 'asc' }, take: 3 },
          agente: { select: { id:true, slug:true, nombre:true, apellido:true, telefono:true, whatsapp:true, foto:true } },
        },
      }),
      prisma.propiedad.count({ where }),
    ])

    res.setHeader('Cache-Control', 'public, max-age=60')
    res.json({ data, total, page: pageNum, pageSize: pageSizeNum, totalPages: Math.ceil(total / pageSizeNum) })
  } catch (err) { next(err) }
})

// GET /api/v1/propiedades/:slug
propiedadesRouter.get('/:slug', async (req, res, next) => {
  try {
    const propiedad = await prisma.propiedad.findUnique({
      where: { slug: req.params.slug, activa: true },
      include: {
        fotos: { orderBy: { orden: 'asc' } },
        agente: { select: { id:true, slug:true, nombre:true, apellido:true, telefono:true, whatsapp:true, foto:true, bio:true } },
      },
    })
    if (!propiedad) { res.status(404).json({ error: 'Not Found', message: 'Propiedad no encontrada', statusCode: 404 }); return }
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.json(propiedad)
  } catch (err) { next(err) }
})
```

- [ ] **Step 2: Crear routes/agentes.ts**

```typescript
// /Users/user/Desktop/ELITE/apps/api/src/routes/agentes.ts
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

export const agentesRouter = Router()

agentesRouter.get('/', async (_req, res, next) => {
  try {
    const agentes = await prisma.agente.findMany({
      where: { activo: true },
      select: {
        id:true, slug:true, nombre:true, apellido:true,
        telefono:true, whatsapp:true, foto:true, bio:true,
        _count: { select: { propiedades: { where: { activa:true } } } },
      },
      orderBy: { nombre: 'asc' },
    })
    const result = agentes.map(a => ({
      ...a, propiedadesCount: a._count.propiedades, _count: undefined,
    }))
    res.setHeader('Cache-Control', 'public, max-age=300')
    res.json(result)
  } catch (err) { next(err) }
})

agentesRouter.get('/:slug', async (req, res, next) => {
  try {
    const agente = await prisma.agente.findUnique({
      where: { slug: req.params.slug, activo: true },
      include: {
        propiedades: {
          where: { activa: true },
          include: { fotos: { orderBy: { orden: 'asc' }, take: 1 } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!agente) { res.status(404).json({ error: 'Not Found', message: 'Agente no encontrado', statusCode: 404 }); return }
    res.setHeader('Cache-Control', 'public, max-age=300')
    res.json(agente)
  } catch (err) { next(err) }
})
```

- [ ] **Step 3: Crear routes/testimonios.ts**

```typescript
// /Users/user/Desktop/ELITE/apps/api/src/routes/testimonios.ts
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

export const testimoniosRouter = Router()

testimoniosRouter.get('/', async (_req, res, next) => {
  try {
    const testimonios = await prisma.testimonio.findMany({
      where: { activo: true },
      orderBy: { createdAt: 'desc' },
    })
    res.setHeader('Cache-Control', 'public, max-age=300')
    res.json(testimonios)
  } catch (err) { next(err) }
})
```

- [ ] **Step 4: Registrar rutas en app.ts**

Editar `apps/api/src/app.ts` — agregar despues del `app.use(cookieParser())`:

```typescript
import { propiedadesRouter } from './routes/propiedades.js'
import { agentesRouter } from './routes/agentes.js'
import { testimoniosRouter } from './routes/testimonios.js'

// ... dentro de createApp():
app.use('/api/v1/propiedades', propiedadesRouter)
app.use('/api/v1/agentes', agentesRouter)
app.use('/api/v1/testimonios', testimoniosRouter)
```

- [ ] **Step 5: Verificar endpoints manualmente**

```bash
cd /Users/user/Desktop/ELITE/apps/api && pnpm dev &
sleep 2

curl -s http://localhost:8080/api/v1/propiedades/count | python3 -m json.tool
# Expected: {"venta":1,"alquiler":1,"anticretico":1,"total":3}

curl -s "http://localhost:8080/api/v1/propiedades/destacadas" | python3 -m json.tool | head -30
# Expected: array de 3 propiedades con fotos y agente

curl -s "http://localhost:8080/api/v1/propiedades?tipo=VENTA" | python3 -m json.tool | head -20
# Expected: {"data":[...],"total":1,"page":1,"pageSize":12,"totalPages":1}

curl -s "http://localhost:8080/api/v1/agentes" | python3 -m json.tool | head -20
# Expected: array de 2 agentes con propiedadesCount

curl -s "http://localhost:8080/api/v1/testimonios" | python3 -m json.tool | head -20
# Expected: array de 3 testimonios
```

- [ ] **Step 6: Commit**

```bash
kill %1 2>/dev/null  # detener server de background
cd /Users/user/Desktop/ELITE
git add apps/api/src/
git commit -m "feat: add public API endpoints for propiedades, agentes, testimonios"
```
