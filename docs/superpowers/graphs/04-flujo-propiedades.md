# Diagrama 4: Flujo de Propiedades — CRM a Sitio Publico

**Proposito:** Muestra como una propiedad va desde ser creada en el CRM hasta aparecer en el sitio publico y generar un PDF con branding.

---

```mermaid
flowchart TD
    subgraph CRM["CRM Angular — /ELITE-CRM/ADMIN/"]
        LOGIN["Agente / Super Admin<br/>Autenticado con JWT"]
        FORM["Formulario Nueva Propiedad<br/>Titulo · Descripcion · Tipo · Precio<br/>Ciudad · Zona · Dormitorios · Banos<br/>Superficie · Garage · Amueblado"]
        FOTOS["Upload de Fotos<br/>Drag & Drop multiple<br/>Maximo 20 fotos por propiedad"]
        FICHA["Ficha Tecnica Completa<br/>Seleccion de agente responsable<br/>Marcar como Destacada"]
        VALIDATE["Validacion Angular<br/>Reactive Forms + Zod"]
    end

    subgraph API_FLOW["API — Node/Express"]
        POST_PROP["POST /api/v1/admin/propiedades<br/>JWT middleware verifica rol"]
        UP_FOTOS["POST /api/v1/admin/fotos<br/>Recibe archivos multipart"]
        CLOUD_UP["Cloudinary Upload<br/>Genera URL + thumbnail URL<br/>Optimizacion automatica WebP"]
        SLUG["Generar slug unico<br/>kebab-case del titulo + cuid"]
        SAVE_DB["Prisma.propiedad.create()<br/>Prisma.foto.createMany()"]
    end

    subgraph DB_LAYER["PostgreSQL — Datos"]
        PROP_ROW["Tabla: Propiedad<br/>id · slug · titulo · tipo<br/>precio · ciudad · activa · destacada"]
        FOTO_ROW["Tabla: Foto<br/>url · urlThumb · orden · propiedadId"]
        AGENTE_ROW["Tabla: Agente<br/>nombre · whatsapp · foto · slug"]
    end

    subgraph PUBLIC_SITE["Sitio Publico — React"]
        API_GET["GET /api/v1/propiedades/destacadas<br/>GET /api/v1/propiedades?filtros"]
        PROP_CARD["PropertyCard.tsx<br/>Imagen · Precio · Specs · Agente · WhatsApp"]
        PROP_DETAIL["PropiedadDetailPage.tsx<br/>Galeria fotos · Mapa · Descripcion completa"]
        LEAFLET["Mapa Leaflet<br/>Pin personalizado en ubicacion"]
        WA_BTN["Boton WhatsApp<br/>wa.me/{agente.whatsapp}"]
    end

    subgraph PDF_FLOW["Generador de PDF — Puppeteer"]
        PDF_REQ["GET /ELITE-CRM/ADMIN/pdf/:propiedadId<br/>JWT requerido"]
        PDF_TMPL["Template HTML Puppeteer<br/>Branding ELITE Nuvia completo"]
        PDF_CONTENT["Contenido del PDF:<br/>Logo SVG · Colores corporativos<br/>Fotos en grilla · Precio grande<br/>Ficha tecnica completa<br/>Foto + Nombre + Tel del agente<br/>QR WhatsApp del agente<br/>Slogan en pie de pagina"]
        PDF_OUT["Descarga PDF<br/>elite-nuvia-[slug]-[agente].pdf"]
    end

    LOGIN --> FORM
    FORM --> FOTOS
    FOTOS --> FICHA
    FICHA --> VALIDATE
    VALIDATE -->|"Datos validos"| POST_PROP
    VALIDATE -->|"Error"| FORM
    POST_PROP --> SLUG
    POST_PROP --> UP_FOTOS
    UP_FOTOS --> CLOUD_UP
    CLOUD_UP --> SAVE_DB
    SLUG --> SAVE_DB
    SAVE_DB --> PROP_ROW
    SAVE_DB --> FOTO_ROW
    PROP_ROW -.->|"agenteId"| AGENTE_ROW

    PROP_ROW -->|"activa=true"| API_GET
    FOTO_ROW --> API_GET
    API_GET --> PROP_CARD
    API_GET --> PROP_DETAIL
    PROP_DETAIL --> LEAFLET
    PROP_DETAIL --> WA_BTN

    PDF_REQ --> PDF_TMPL
    PROP_ROW -->|"datos"| PDF_TMPL
    FOTO_ROW -->|"fotos"| PDF_TMPL
    AGENTE_ROW -->|"datos agente + QR"| PDF_TMPL
    PDF_TMPL --> PDF_CONTENT
    PDF_CONTENT --> PDF_OUT

    style CRM fill:#1a1a1a,color:#C9A84C,stroke:#C9A84C
    style API_FLOW fill:#0A2416,color:#fff,stroke:#C9A84C
    style DB_LAYER fill:#1a3a6a,color:#fff,stroke:#60a5fa
    style PUBLIC_SITE fill:#0D3B27,color:#C9A84C,stroke:#C9A84C
    style PDF_FLOW fill:#3a1a0a,color:#fb923c,stroke:#fb923c
```

---

## Estados de una Propiedad

```mermaid
stateDiagram-v2
    [*] --> Borrador: Agente crea propiedad
    Borrador --> Activa: activa = true<br/>(Super Admin o Agente)
    Activa --> Destacada: destacada = true<br/>(Solo Super Admin)
    Activa --> Inactiva: activa = false<br/>(vendida / retirada)
    Destacada --> Activa: destacada = false
    Inactiva --> Activa: reactivar
    Inactiva --> [*]: eliminar

    note right of Activa: Aparece en sitio publico
    note right of Destacada: Aparece en seccion hero
    note right of Borrador: Solo visible en CRM
    note right of Inactiva: Oculta del publico
```
