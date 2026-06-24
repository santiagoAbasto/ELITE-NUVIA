# 03 — Data Models & Prisma Migrations

## Files to modify

- Modify: `apps/api/prisma/schema.prisma`
- Run: `pnpm --filter @elite/api db:migrate`
- Run: `pnpm --filter @elite/api db:generate`

---

## Task 1 — Add enums

- [ ] Add to `schema.prisma` after existing enums:

```prisma
enum TipoEvento {
  VISITA
  LLAMADA
  CIERRE
  REUNION
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

---

## Task 2 — Extend Agente model

- [ ] In `schema.prisma`, update `model Agente` — add fields after `whatsapp`:

```prisma
  primerApellido      String?
  segundoApellido     String?
  fechaNacimiento     DateTime?
  contratoUrl         String?
  contratoInicio      DateTime?
  contratoFin         DateTime?
  captaciones         Captacion[]
  eventos             Evento[]
  interacciones       Interaccion[]
  actividadesCaptacion ActividadCaptacion[]
  notificaciones      Notificacion[]
```

---

## Task 3 — Extend Lead model

- [ ] In `schema.prisma`, update `model Lead` — add fields after `estado`:

```prisma
  temperatura         String    @default("FRIO")
  presupuesto         Decimal?  @db.Decimal(12, 2)
  preferencias        Json?
  valorCierre         Decimal?  @db.Decimal(12, 2)
  comision            Decimal?  @db.Decimal(12, 2)
  interacciones       Interaccion[]
  eventos             Evento[]
```

---

## Task 4 — Extend Propiedad model

- [ ] Add field to `model Propiedad`:

```prisma
  agenteAsignadoId    String?
  captacion           Captacion?
  eventos             Evento[]
```

---

## Task 5 — New models

- [ ] Add after existing models in `schema.prisma`:

```prisma
model SiteContent {
  id        String   @id @default(cuid())
  seccion   String   @unique
  datos     Json
  updatedAt DateTime @updatedAt
  updatedBy String?
  @@map("site_content")
}

model Captacion {
  id                  String          @id @default(cuid())
  propietarioNombre   String
  propietarioTelefono String
  propietarioEmail    String?
  propietarioDoc      String?
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
  precioSolicitado    Decimal         @db.Decimal(12, 2)
  precioSugerido      Decimal?        @db.Decimal(12, 2)
  moneda              String          @default("BOB")
  comisionPct         Decimal?        @db.Decimal(5, 2)
  fechaCaptacion      DateTime        @default(now())
  contratoUrl         String?
  exclusividadInicio  DateTime?
  exclusividadFin     DateTime?
  estado              EstadoCaptacion @default(EN_NEGOCIACION)
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
  id          String    @id @default(cuid())
  captacionId String
  captacion   Captacion @relation(fields: [captacionId], references: [id], onDelete: Cascade)
  agenteId    String
  agente      Agente    @relation(fields: [agenteId], references: [id])
  tipo        String
  descripcion String
  createdAt   DateTime  @default(now())
  @@map("actividades_captacion")
}

model Evento {
  id          String     @id @default(cuid())
  titulo      String
  tipo        TipoEvento
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
  tipo      String
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
```

---

## Task 6 — Run migration

- [ ] `pnpm --filter @elite/api db:migrate -- --name admin_crm_v1`
- [ ] `pnpm --filter @elite/api db:generate`
- [ ] `pnpm --filter @elite/api typecheck` — must pass
- [ ] Commit: `feat(db): add SiteContent, Captacion, Evento, Interaccion, Notificacion models`
