# Admin Panel — CMS + CRM Design Spec
**Date:** 2026-06-23  
**Status:** Approved

---

## 1. Overview

Build a full admin panel at `/admin/*` inside `apps/web` (React/Vite, port 3000).  
Two subsystems: **CMS** (edit all public website content) and **CRM** (real estate pipeline, agents, leads, agenda, reports).  
Backend: existing Express + Prisma + PostgreSQL API. Media: Cloudinary (already configured).

---

## 2. Architecture

### Approach
Admin is a **lazy-loaded module** inside `apps/web`. The public bundle pays zero cost.

```
src/
├── admin/
│   ├── AdminApp.tsx              # root layout: sidebar + topbar + <Outlet>
│   ├── AdminRouter.tsx           # all /admin/* routes
│   ├── context/
│   │   └── AdminAuthContext.tsx  # JWT, user, role
│   ├── cms/                      # CMS module
│   ├── crm/                      # CRM module
│   └── shared/                   # shared admin components
├── pages/                        # public site (unchanged)
└── App.tsx                       # adds lazy /admin/* route
```

### Integration in App.tsx
```tsx
const AdminApp = lazy(() => import('./admin/AdminApp'))
<Route path="/admin/*" element={<Suspense fallback={<Spinner />}><AdminApp /></Suspense>} />
```

### Auth
- Login: `/admin/login` → `POST /api/v1/auth/login` (existing endpoint)
- JWT stored in `httpOnly cookie` (already implemented in API)
- Route guard: unauthenticated → redirect to `/admin/login`
- First-login forced password change for agents

---

## 3. Roles & Permissions

| Module | SUPER_ADMIN | COORDINADOR | AGENTE |
|---|---|---|---|
| CMS | Full access | None | None |
| Agent management | Create/edit/deactivate | View list | Own profile |
| All properties (view) | Full | Full | Todos (solo lectura) |
| Edit property | Full | Full | Solo si es su captación O SUPER_ADMIN la asignó |
| All leads | Full | Full | Own only |
| Agenda | All agents + own | All agents | Own only |
| Global reports | Full | Full | Own metrics only |
| PDF export | Any property | Any property | Own only |
| System settings | Full | None | None |

---

## 4. CMS Module

### Editable Sections (sidebar order matches public navbar)
1. Home → Hero (video, title, subtitle, CTA button text)
2. Propiedades → section title, subtitle, filter labels
3. Agentes → section title, subtitle (agent data managed in CRM)
4. Servicios → each service: title, description, icon/image
5. Nosotros → timeline entries, mission text, stats
6. Contacto → address, phone, email, map embed URL, form labels
7. Footer → logo, links, social URLs, legal text

### Storage
```prisma
model SiteContent {
  id        String   @id @default(cuid())
  seccion   String   @unique  // "hero" | "servicios" | "nosotros" | etc.
  datos     Json
  updatedAt DateTime @updatedAt
  updatedBy String?
}
```

### Edit Flow
1. Admin opens section from sidebar
2. Current JSON loaded into form
3. Text fields → TipTap rich text editor
4. Images/video → upload to Cloudinary via API, returns URL stored in JSON
5. Save → `PUT /api/v1/cms/:seccion`
6. Public site reads → `GET /api/v1/cms/:seccion` on load

### UI Layout
- Left panel: section tree (same order as public navbar)
- Right panel: form for selected section
- "Preview" button: opens public site in new tab

---

## 5. CRM Module

### 5.1 Agents Module (SUPER_ADMIN only)

**Created exclusively by SUPER_ADMIN.**

Agent form fields:
- Primer nombre, primer apellido, segundo apellido
- Fecha de nacimiento, edad (calculada automáticamente)
- Foto de perfil (Cloudinary upload)
- Correo corporativo (ej. nombre@elitnuvia.com)
- Número de teléfono
- Tiempo de contrato: fecha inicio + fecha fin
- Subir contrato (PDF — almacenado en Cloudinary)
- Estado: Activo / Inactivo / Suspendido
- Credenciales de acceso: correo corporativo como usuario + contraseña temporal (forzado cambio en primer login)

**Ficha de agente (vista interna):**
- Datos completos + foto
- Contrato adjunto con fecha de vencimiento (alerta cuando falten 30 días)
- Métricas: propiedades activas, captaciones activas, cierres del mes, tasa de conversión
- Historial de actividades completo del agente
- Acceso a su agenda

**Permisos del agente en el CRM:**
- Ver TODAS las propiedades del sistema (solo lectura: fotos, datos, consulta)
- Generar fichas PDF de cualquier propiedad (con sus datos impresos)
- Crear sus propias captaciones y subir archivos a ellas
- Editar (CRUD completo) una propiedad ÚNICAMENTE si:
  - Es su propia captación (él la captó), O
  - SUPER_ADMIN se la asignó explícitamente con permiso de edición
- Sin ninguna de esas dos condiciones → vista de solo lectura, sin edición
- Ver y gestionar sus leads asignados
- Su agenda personal

### 5.2 Captaciones Module

Una **captación** es el proceso de captar un bien inmueble de un propietario para comercializarlo (venta, alquiler o anticretico). Es el punto de entrada al inventario de propiedades.

**Flujo completo de captación:**

```
PROSPECTO → VISITA DE CAPTACIÓN → ACUERDO → PUBLICACIÓN → SEGUIMIENTO → CIERRE
```

**Formulario de captación (creado por agente o SUPER_ADMIN):**

Datos del propietario:
- Nombre completo, teléfono, email
- Documento de identidad
- Datos de contacto adicionales

Datos del inmueble:
- Tipo: Casa / Departamento / Garzonier / Terreno / Local / Otro
- Operación: Venta / Alquiler / Anticretico
- Dirección, ciudad, zona
- Características: m2, dormitorios, baños, garage, amueblado, piscina
- Precio solicitado por el propietario
- Precio sugerido por el agente
- Fotos del inmueble (hasta 20, drag-and-drop)
- Observaciones (TipTap)

Datos del acuerdo:
- Fecha de captación
- Duración del acuerdo de exclusividad (fecha inicio + fecha fin)
- Comisión acordada (%)
- Subir contrato de captación (PDF)

**Estados de la captación:**
```
EN NEGOCIACIÓN → CAPTADA → PUBLICADA → EN CIERRE → CERRADA → EXPIRADA
```

**Registro de actividades de la captación (timeline sin perder el hilo):**
Cada acción queda registrada con: tipo, descripción, agente, fecha/hora.
Tipos: Llamada al propietario | Visita al inmueble | Foto actualizada | Precio ajustado | Documento subido | Nota interna | Publicada en portal | Visita de cliente | Oferta recibida | Cierre

**Ficha PDF de captación:**
- Datos del inmueble (fotos, características, precio)
- Datos completos del agente responsable: foto, nombre completo, teléfono, correo corporativo, logo de la empresa
- Código QR al listing público (cuando está publicada)
- Fecha de generación

Al marcar una captación como **CAPTADA** → se convierte automáticamente en una `Propiedad` publicable en el sitio.

### 5.3 Properties Module (full CRUD)

- Up to 20 photos with drag-and-drop reordering
- States: Activa / Pausada / Reservada / Cerrada
- Fields: title, description (TipTap), type, operation, price, currency, city, zone, address, lat/lng, bedrooms, bathrooms, sqm, garage, furnished, pool
- Assign agent
- Internal property sheet:
  - Full activity timeline (leads, visits, notes, state changes, price history)
  - PDF export with logo + agent data
- Filters: type, operation, city, agent, state

### 5.3 Leads — Kanban Pipeline

Columns:
```
NUEVO → EN CONTACTO → INTERESADO → NEGOCIACIÓN → CERRADO → PERDIDO
```

Lead fields:
- Cliente: nombre, teléfono, email
- presupuesto, preferencias (Json: zones, types, features)
- temperatura: Frío / Tibio / Caliente
- Propiedad(es) de interés (multiple)
- Agente asignado (reassignable by SUPER_ADMIN)

Lead detail:
- Interaction timeline: note | call | visit | email | whatsapp
- Each interaction: type, text, timestamp, agent
- Link to calendar event if applicable
- On CERRADO: tipo (venta/alquiler/anticretico), valor final, comisión estimada

### 5.4 Agenda — Visual Calendar

Library: `react-big-calendar`  
Views: month / week / day

Event types (color-coded, no generic icons):
- Visita
- Llamada
- Cierre
- Reunión interna

Each event links: agente, lead/cliente, propiedad, notas.  
SUPER_ADMIN: filter by agent, multi-agent overlay view.  
Creating a visit from a lead → auto-creates event + records interaction in lead timeline.

### 5.5 Reports

**Global dashboard (SUPER_ADMIN / COORDINADOR):**
- Active properties by type and zone
- Leads by state, by agent, by week/month
- Conversion rate per agent
- Estimated monthly revenue from closings
- Zone activity heatmap

**Agent dashboard:**
- Own active properties
- Own leads by state
- Upcoming agenda events
- Monthly closings and estimated commissions

### 5.6 Notifications

In-app notification bell + email (nodemailer via existing API):

| Event | Recipients |
|---|---|
| New inbound lead | Assigned agent + SUPER_ADMIN |
| Lead with no activity for 3 days | Assigned agent |
| Visit in next 2 hours | Assigned agent |
| Property not updated in 30 days | Assigned agent + SUPER_ADMIN |
| Closing registered | SUPER_ADMIN |

### 5.7 PDF Export

Property PDF includes: photos, full details, agent info, company logo, QR code to public listing.  
Already partially implemented in `apps/api/src/routes/admin.ts` and `src/lib/pdf.ts`.

---

## 6. New DB Models

```prisma
model SiteContent {
  id        String   @id @default(cuid())
  seccion   String   @unique
  datos     Json
  updatedAt DateTime @updatedAt
  updatedBy String?
}

model Evento {
  id          String     @id @default(cuid())
  titulo      String
  tipo        TipoEvento // VISITA | LLAMADA | CIERRE | REUNION
  inicio      DateTime
  fin         DateTime
  agenteId    String
  agente      Agente     @relation(fields: [agenteId], references: [id])
  leadId      String?
  lead        Lead?      @relation(fields: [leadId], references: [id])
  propiedadId String?
  propiedad   Propiedad? @relation(fields: [propiedadId], references: [id])
  notas       String?
  createdAt   DateTime   @default(now())

  @@map("eventos")
}

model Interaccion {
  id        String   @id @default(cuid())
  leadId    String
  lead      Lead     @relation(fields: [leadId], references: [id])
  agenteId  String
  agente    Agente   @relation(fields: [agenteId], references: [id])
  tipo      String   // nota | llamada | visita | email | whatsapp
  texto     String
  eventoId  String?
  createdAt DateTime @default(now())

  @@map("interacciones")
}

model Notificacion {
  id           String   @id @default(cuid())
  userId       String
  titulo       String
  cuerpo       String
  leida        Boolean  @default(false)
  tipo         String
  referenciaId String?
  createdAt    DateTime @default(now())

  @@map("notificaciones")
}

enum TipoEvento {
  VISITA
  LLAMADA
  CIERRE
  REUNION
}
```

```prisma
model Captacion {
  id                  String          @id @default(cuid())
  // Propietario
  propietarioNombre   String
  propietarioTelefono String
  propietarioEmail    String?
  propietarioDoc      String?
  // Inmueble
  tipoInmueble        TipoInmueble
  tipo                TipoOperacion
  ciudad              String
  zona                String?
  direccion           String?
  descripcion         String?
  dormitorios         Int?
  banos               Int?
  superficieM2        Decimal?        @db.Decimal(10, 2)
  garage              Boolean         @default(false)
  amueblado           Boolean         @default(false)
  piscina             Boolean         @default(false)
  fotos               Json            @default("[]")
  // Acuerdo
  precioSolicitado    Decimal         @db.Decimal(12, 2)
  precioSugerido      Decimal?        @db.Decimal(12, 2)
  moneda              String          @default("BOB")
  comisionPct         Decimal?        @db.Decimal(5, 2)
  fechaCaptacion      DateTime        @default(now())
  contratoUrl         String?
  exclusividadInicio  DateTime?
  exclusividadFin     DateTime?
  // Estado
  estado              EstadoCaptacion @default(EN_NEGOCIACION)
  // Relaciones
  agenteId            String
  agente              Agente          @relation(fields: [agenteId], references: [id])
  propiedadId         String?         @unique
  propiedad           Propiedad?      @relation(fields: [propiedadId], references: [id])
  actividades         ActividadCaptacion[]
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  @@map("captaciones")
}

model ActividadCaptacion {
  id           String     @id @default(cuid())
  captacionId  String
  captacion    Captacion  @relation(fields: [captacionId], references: [id], onDelete: Cascade)
  agenteId     String
  agente       Agente     @relation(fields: [agenteId], references: [id])
  tipo         String     // llamada | visita_inmueble | foto_actualizada | precio_ajustado | documento | nota | publicada | visita_cliente | oferta | cierre
  descripcion  String
  createdAt    DateTime   @default(now())

  @@map("actividades_captacion")
}

enum EstadoCaptacion {
  EN_NEGOCIACION
  CAPTADA
  PUBLICADA
  EN_CIERRE
  CERRADA
  EXPIRADA
}
```

**Existing model additions:**
```prisma
// Agente: add
primerApellido      String
segundoApellido     String?
fechaNacimiento     DateTime?
tiempoContratoInicio DateTime?
tiempoContratoFin   DateTime?
contratoUrl         String?   // PDF subido a Cloudinary

// Lead: add
temperatura   String   @default("FRIO") // FRIO | TIBIO | CALIENTE
presupuesto   Decimal? @db.Decimal(12, 2)
preferencias  Json?
valorCierre   Decimal? @db.Decimal(12, 2)
comision      Decimal? @db.Decimal(12, 2)
```

---

## 7. Tech Stack (additions)

| Package | Purpose |
|---|---|
| `@tiptap/react` + extensions | Rich text editor (CMS + bio + lead notes) |
| `react-big-calendar` + `date-fns` | Visual calendar for agenda |
| `@dnd-kit/core` | Drag-and-drop (kanban pipeline + photo reorder) |
| `recharts` | Charts for reports dashboard |
| `react-hook-form` + `zod` | Form validation |
| `react-hot-toast` | In-app notifications/toasts |

---

## 8. SEO (Public Site)

SEO skill installed via `github.com/AgriciDaniel/claude-seo`.  
Run `/seo audit <url>` to audit public pages.  
SEO metadata (title, description, OG tags) per section editable from CMS.

---

## 9. Out of Scope (this spec)

- Mobile app
- WhatsApp Business API integration (beyond existing FAB)
- Payment processing
- E-signature for contracts
