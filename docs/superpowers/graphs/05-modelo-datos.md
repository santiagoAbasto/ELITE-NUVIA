# Diagrama 5: Modelo de Datos — ELITE Nuvia

**Proposito:** Relaciones entre todas las entidades del sistema. Sirve como referencia para el schema Prisma y las migraciones.

---

```mermaid
erDiagram
    User {
        String id PK
        String email UK
        String password
        Rol rol
        String agenteId FK
        Boolean activo
        DateTime createdAt
    }

    Agente {
        String id PK
        String slug UK
        String nombre
        String apellido
        String email UK
        String telefono
        String whatsapp
        String foto
        String bio
        Boolean activo
    }

    Propiedad {
        String id PK
        String slug UK
        String titulo
        String descripcion
        TipoOperacion tipo
        TipoInmueble tipoInmueble
        Decimal precio
        String moneda
        String ciudad
        String zona
        String direccion
        Int dormitorios
        Int banos
        Decimal superficieM2
        Boolean garage
        Boolean amueblado
        Boolean piscina
        String agenteId FK
        Boolean destacada
        Boolean activa
        DateTime createdAt
        DateTime updatedAt
    }

    Foto {
        String id PK
        String url
        String urlThumb
        Int orden
        String propiedadId FK
    }

    Testimonio {
        String id PK
        String nombre
        String ciudad
        String texto
        Int rating
        TipoOperacion tipo
        String foto
        Boolean activo
    }

    Lead {
        String id PK
        String nombre
        String email
        String telefono
        String mensaje
        String propiedadId FK
        String agenteId FK
        LeadEstado estado
        DateTime createdAt
    }

    PdfExport {
        String id PK
        String propiedadId FK
        String agenteId FK
        String url
        DateTime generadoAt
    }

    User ||--o| Agente : "tiene perfil"
    Agente ||--o{ Propiedad : "gestiona"
    Propiedad ||--o{ Foto : "tiene"
    Propiedad ||--o{ Lead : "genera"
    Propiedad ||--o{ PdfExport : "exportada como"
    Agente ||--o{ Lead : "asignado a"
    Agente ||--o{ PdfExport : "en el PDF"
```

---

## Enums

```mermaid
graph LR
    subgraph TipoOperacion
        V["VENTA"]
        A["ALQUILER"]
        AN["ANTICRETICO"]
    end

    subgraph TipoInmueble
        CA["CASA"]
        DE["DEPARTAMENTO"]
        GA["GARZONIER"]
        TE["TERRENO"]
        LO["LOCAL"]
        OT["OTRO"]
    end

    subgraph Rol
        SA["SUPER_ADMIN"]
        AG["AGENTE"]
        CO["COORDINADOR"]
    end

    subgraph LeadEstado
        NU["NUEVO"]
        EN["EN_CONTACTO"]
        IN["INTERESADO"]
        NE["NEGOCIACION"]
        CE["CERRADO"]
        PE["PERDIDO"]
    end
```

---

## Permisos por Rol

| Operacion | SUPER_ADMIN | AGENTE | COORDINADOR |
|---|---|---|---|
| Ver todas las propiedades | Si | Solo las suyas | Si |
| Crear propiedad | Si | Si | No |
| Editar propiedad | Si | Solo las suyas | No |
| Eliminar propiedad | Si | No | No |
| Crear/editar agentes | Si | Solo su perfil | No |
| Ver todos los leads | Si | Solo los suyos | Si |
| Asignar leads a agentes | Si | No | Si |
| Generar PDF | Si | Solo sus propiedades | No |
| Ver reportes globales | Si | No | Si |
| Configuracion del sistema | Si | No | No |
