# Diagrama 2: Rutas del Servidor — ELITE Nuvia

**Proposito:** Mapa completo de todas las rutas del servidor unico en puerto 8080.  
**Regla critica:** Ninguna ruta publica enlaza al CRM. El CRM es invisible desde el exterior.

---

```mermaid
graph LR
    BROWSER["Navegador"] --> SERVER["localhost:8080<br/>Express Server"]

    SERVER --> R1["/"]
    SERVER --> R2["/propiedades"]
    SERVER --> R3["/propiedades/:slug"]
    SERVER --> R4["/agentes/:slug"]
    SERVER --> R5["/servicios"]
    SERVER --> R6["/nosotros"]
    SERVER --> R7["/contacto"]
    SERVER --> RCRM["---OCULTO---<br/>/ELITE-CRM/ADMIN/login"]
    SERVER --> RDASH["/ELITE-CRM/ADMIN/dashboard"]
    SERVER --> RPROP["/ELITE-CRM/ADMIN/propiedades"]
    SERVER --> RAGEN["/ELITE-CRM/ADMIN/agentes"]
    SERVER --> RLEADS["/ELITE-CRM/ADMIN/leads"]
    SERVER --> RPDF["/ELITE-CRM/ADMIN/pdf/:id"]
    SERVER --> RAPI["/api/v1/*"]

    subgraph PUBLIC["Publico — React Build (indexable)"]
        R1 --> HOME["HomePage.tsx"]
        R2 --> PLIST["PropiedadesPage.tsx"]
        R3 --> PDETAIL["PropiedadDetailPage.tsx"]
        R4 --> AGENT["AgentePage.tsx"]
        R5 --> SVC["ServiciosPage.tsx"]
        R6 --> ABOUT["NosotrosPage.tsx"]
        R7 --> CONTACT["ContactoPage.tsx"]
    end

    subgraph HIDDEN["Oculto — Angular Build (NO indexado)"]
        RCRM --> LOGIN["LoginComponent<br/>Sin JWT → muestra form"]
        RDASH --> GUARD{"AuthGuard<br/>JWT valido?"}
        RPROP --> GUARD
        RAGEN --> GUARD
        RLEADS --> GUARD
        RPDF --> GUARD
        GUARD -->|"NO"| REDIR["Redirect a /login"]
        GUARD -->|"SI"| CRM_VIEWS["Dashboard / Propiedades<br/>Agentes / Leads / PDF"]
    end

    subgraph API["API — Express Routes (mixta)"]
        RAPI --> API_PUB["GET propiedades<br/>GET agentes<br/>GET testimonios<br/>(sin auth)"]
        RAPI --> API_AUTH["POST auth/login<br/>POST auth/refresh<br/>POST auth/logout"]
        RAPI --> API_PRIV["POST/PUT/DELETE propiedades<br/>POST/PUT/DELETE agentes<br/>GET leads<br/>(JWT required)"]
    end

    subgraph ROBOTS["SEO / Seguridad"]
        BOT["robots.txt"]
        SITEMAP["sitemap.xml"]
        BOT --> DISALLOW["Disallow: /ELITE-CRM/"]
        SITEMAP --> ONLY_PUBLIC["Solo rutas publicas<br/>NUNCA /ELITE-CRM/"]
    end

    style PUBLIC fill:#0D3B27,color:#fff,stroke:#C9A84C
    style HIDDEN fill:#1a1a1a,color:#C9A84C,stroke:#C9A84C,stroke-dasharray:6
    style API fill:#1a3a6a,color:#fff,stroke:#60a5fa
    style ROBOTS fill:#3a1a0a,color:#fb923c,stroke:#fb923c
    style RCRM fill:#1a1a1a,color:#C9A84C,stroke:red,stroke-dasharray:4
    style GUARD fill:#2a1a0a,color:#f59e0b,stroke:#f59e0b
```

---

## Tabla de Rutas

| Ruta | Tipo | Tecnologia | Auth | Indexable |
|---|---|---|---|---|
| `localhost:8080/` | Publica | React SPA | No | Si |
| `localhost:8080/propiedades` | Publica | React SPA | No | Si |
| `localhost:8080/propiedades/:slug` | Publica | React SPA | No | Si |
| `localhost:8080/agentes/:slug` | Publica | React SPA | No | Si |
| `localhost:8080/servicios` | Publica | React SPA | No | Si |
| `localhost:8080/nosotros` | Publica | React SPA | No | Si |
| `localhost:8080/contacto` | Publica | React SPA | No | Si |
| `localhost:8080/ELITE-CRM/ADMIN/login` | **Oculta** | Angular | No (form) | **No** |
| `localhost:8080/ELITE-CRM/ADMIN/dashboard` | **Protegida** | Angular | JWT | **No** |
| `localhost:8080/ELITE-CRM/ADMIN/propiedades` | **Protegida** | Angular | JWT | **No** |
| `localhost:8080/ELITE-CRM/ADMIN/agentes` | **Protegida** | Angular | JWT | **No** |
| `localhost:8080/ELITE-CRM/ADMIN/leads` | **Protegida** | Angular | JWT | **No** |
| `localhost:8080/ELITE-CRM/ADMIN/pdf/:id` | **Protegida** | Angular+Node | JWT | **No** |
| `localhost:8080/api/v1/propiedades*` | API Publica | Express | No | No |
| `localhost:8080/api/v1/agentes*` | API Publica | Express | No | No |
| `localhost:8080/api/v1/testimonios` | API Publica | Express | No | No |
| `localhost:8080/api/v1/auth/*` | API Auth | Express | No/JWT | No |
| `localhost:8080/api/v1/admin/*` | API Privada | Express | JWT | No |
