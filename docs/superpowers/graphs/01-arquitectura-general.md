# Diagrama 1: Arquitectura General — ELITE Nuvia

**Proposito:** Vision completa del sistema: todos los subsistemas, servicios externos y sus relaciones.  
**Audience:** Equipo tecnico, stakeholders, nuevos desarrolladores.  
**Formato:** Mermaid (editable) + descripcion textual.

---

```mermaid
graph TB
    subgraph BROWSER["Navegador / Cliente"]
        PUBLIC["Sitio Publico<br/>React 18 + Vite + TS<br/>Framer Motion · Three.js<br/>Leaflet.js"]
        CRM["CRM Angular<br/>/ELITE-CRM/ADMIN/<br/>JWT Protected · Oculto"]
    end

    subgraph SERVER["Servidor — Puerto 8080"]
        EXPRESS["Express 5 Server<br/>Node.js 20 LTS"]
        STATIC_WEB["express.static()<br/>React build → /"]
        STATIC_CRM["express.static()<br/>Angular build → /ELITE-CRM/ADMIN/"]
        API["REST API<br/>/api/v1/*"]
        RATELIMIT["Rate Limiter<br/>5 req/15min /auth/login"]
        JWT_MW["JWT Middleware<br/>httpOnly cookie verify"]
        PDF["Puppeteer<br/>PDF Generator"]
    end

    subgraph DB["Base de Datos"]
        PRISMA["Prisma 5 ORM"]
        PG["PostgreSQL 16"]
        MODELS["Models:<br/>User · Agente · Propiedad<br/>Foto · Testimonio"]
    end

    subgraph EXTERNAL["Servicios Externos"]
        CLOUDINARY["Cloudinary<br/>Fotos + Thumbnails"]
        CLOUDFRONT["CloudFront CDN<br/>Video Hero MP4"]
        HIGGSFIELD["Higgsfield AI<br/>Video Generation"]
        WA["WhatsApp API<br/>wa.me/VITE_WA_NUMBER"]
    end

    PUBLIC -->|"HTTP requests"| EXPRESS
    CRM -->|"HTTP + JWT cookie"| EXPRESS
    EXPRESS --> STATIC_WEB
    EXPRESS --> STATIC_CRM
    EXPRESS --> API
    API --> RATELIMIT
    API --> JWT_MW
    API --> PRISMA
    API --> PDF
    PRISMA --> PG
    PG --> MODELS
    PDF --> CLOUDINARY
    PUBLIC -->|"Fotos propiedades"| CLOUDINARY
    PUBLIC -->|"Video hero"| CLOUDFRONT
    HIGGSFIELD -->|"Genera video"| CLOUDFRONT
    PUBLIC -->|"FAB flotante"| WA
    CRM -->|"Subir fotos"| CLOUDINARY

    style PUBLIC fill:#0D3B27,color:#C9A84C,stroke:#C9A84C
    style CRM fill:#1a1a1a,color:#C9A84C,stroke:#C9A84C,stroke-dasharray:5
    style EXPRESS fill:#0A2416,color:#fff,stroke:#C9A84C
    style PG fill:#1a3a6a,color:#fff,stroke:#60a5fa
    style PRISMA fill:#1a3a6a,color:#fff,stroke:#60a5fa
    style CLOUDINARY fill:#4a2a0a,color:#f59e0b,stroke:#f59e0b
    style CLOUDFRONT fill:#4a2a0a,color:#f59e0b,stroke:#f59e0b
    style HIGGSFIELD fill:#2a0a4a,color:#a78bfa,stroke:#a78bfa
    style WA fill:#0a3a1a,color:#25D366,stroke:#25D366
    style PDF fill:#3a1a0a,color:#fb923c,stroke:#fb923c
```

---

## Descripcion de Componentes

| Componente | Tecnologia | Rol |
|---|---|---|
| **Sitio Publico** | React 18 + Vite + Framer Motion + Three.js | Interface publica — marketing, listado de propiedades, agentes |
| **CRM Angular** | Angular 17 + Angular Material | Interface privada — gestion de propiedades, agentes, leads. Oculto, sin links publicos |
| **Express Server** | Node.js 20 + Express 5 | Sirve ambos builds estaticos + API REST en el mismo puerto 8080 |
| **API REST** | Express routes + Prisma | Endpoints publicos (propiedades, agentes) y privados (CRUD CRM) |
| **JWT Middleware** | jsonwebtoken + httpOnly cookie | Protege todas las rutas `/ELITE-CRM/ADMIN/*` y rutas API privadas |
| **Rate Limiter** | express-rate-limit | Max 5 intentos de login por IP cada 15 minutos |
| **PDF Generator** | Puppeteer headless | Genera PDF de propiedad con fotos, ficha tecnica, datos del agente y QR WhatsApp |
| **Prisma ORM** | Prisma 5 | Capa de acceso a datos — schema tipado, migraciones, seeds |
| **PostgreSQL** | PostgreSQL 16 | Base de datos relacional — modelos: User, Agente, Propiedad, Foto, Testimonio |
| **Cloudinary** | Cloudinary SDK | Upload, transformacion y entrega de fotos de propiedades con URLs optimizadas |
| **CloudFront CDN** | AWS CloudFront | Streaming del video hero generado por Higgsfield sin latencia |
| **Higgsfield AI** | Higgsfield API | Genera el video cinematico de lujo para el hero (pre-deploy, una vez) |
| **WhatsApp** | wa.me deep link | FAB flotante en sitio publico — conecta cliente con agente directamente |

---

## Regla critica de seguridad

> El sitio publico (`/`) NO contiene ningun link, boton ni referencia al CRM.  
> La unica forma de acceder es escribir manualmente `/ELITE-CRM/ADMIN/login` en el navegador.  
> La ruta esta excluida de `robots.txt` y del `sitemap.xml`.
