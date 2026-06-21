# Graph Report - .  (2026-06-21)

## Corpus Check
- Corpus is ~3,126 words - fits in a single context window. You may not need a graph.

## Summary
- 40 nodes · 70 edges · 8 communities (7 shown, 1 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Backend Services|Backend Services]]
- [[_COMMUNITY_Data Models|Data Models]]
- [[_COMMUNITY_Public API|Public API]]
- [[_COMMUNITY_Page Sections|Page Sections]]
- [[_COMMUNITY_Animation & 3D|Animation & 3D]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_Brand & Config|Brand & Config]]
- [[_COMMUNITY_CRM & Auth|CRM & Auth]]

## God Nodes (most connected - your core abstractions)
1. `Framer Motion 11 (Animation Library)` - 12 edges
2. `API — Node.js 20 + Express 5` - 9 edges
3. `Public API Endpoints (/api/v1/*)` - 9 edges
4. `React Frontend (React 18 + Vite + TypeScript)` - 8 edges
5. `Prisma 5 ORM` - 7 edges
6. `Data Model: Agente (Prisma)` - 6 edges
7. `ELITE Nuvia Public Site Design Spec` - 5 edges
8. `Cloudinary (Image Storage + Transformations)` - 5 edges
9. `Data Model: Propiedad (Prisma)` - 5 edges
10. `Three.js + @react-three/fiber + @react-three/drei` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Data Model: User (Prisma)` --authenticated_by--> `JWT Auth (httpOnly cookie, 8h + Refresh 30d)`  [INFERRED]
  superpowers/specs/2026-06-21-elite-nuvia-public-site-design.md → superpowers/specs/2026-06-21-elite-nuvia-public-site-design.md  _Bridges community 0 → community 1_
- `ELITE Nuvia Public Site Design Spec` --defines--> `Brand Identity (ELITE Nuvia)`  [EXTRACTED]
  superpowers/specs/2026-06-21-elite-nuvia-public-site-design.md → superpowers/specs/2026-06-21-elite-nuvia-public-site-design.md  _Bridges community 0 → community 3_
- `React Frontend (React 18 + Vite + TypeScript)` --uses--> `Framer Motion 11 (Animation Library)`  [EXTRACTED]
  superpowers/specs/2026-06-21-elite-nuvia-public-site-design.md → superpowers/specs/2026-06-21-elite-nuvia-public-site-design.md  _Bridges community 0 → community 4_
- `React Frontend (React 18 + Vite + TypeScript)` --uses--> `Leaflet.js + React-Leaflet (Map)`  [EXTRACTED]
  superpowers/specs/2026-06-21-elite-nuvia-public-site-design.md → superpowers/specs/2026-06-21-elite-nuvia-public-site-design.md  _Bridges community 0 → community 2_
- `React Frontend (React 18 + Vite + TypeScript)` --uses--> `Three.js + @react-three/fiber + @react-three/drei`  [EXTRACTED]
  superpowers/specs/2026-06-21-elite-nuvia-public-site-design.md → superpowers/specs/2026-06-21-elite-nuvia-public-site-design.md  _Bridges community 0 → community 6_

## Import Cycles
- None detected.

## Communities (8 total, 1 thin omitted)

### Community 0 - "Backend Services"
Cohesion: 0.31
Nodes (10): API — Node.js 20 + Express 5, CloudFront CDN (Video Streaming), CRM Angular (Private Admin), Higgsfield AI (Cinematic Video Generator), Implementation Phases (15-step plan), JWT Auth (httpOnly cookie, 8h + Refresh 30d), Puppeteer PDF Generator (Headless Node), React Frontend (React 18 + Vite + TypeScript) (+2 more)

### Community 1 - "Data Models"
Cohesion: 0.48
Nodes (7): Cloudinary (Image Storage + Transformations), Data Model: Agente (Prisma), Data Model: Foto (Prisma), Data Model: Propiedad (Prisma), Data Model: User (Prisma), PostgreSQL 16 Database, Prisma 5 ORM

### Community 2 - "Public API"
Cohesion: 0.40
Nodes (6): Public API Endpoints (/api/v1/*), Leaflet.js + React-Leaflet (Map), Data Model: Testimonio (Prisma), Section 03: Featured Properties Grid, Section 02: Advanced Search + Map, Section 07: Testimonials Auto-Slide

### Community 3 - "Page Sections"
Cohesion: 0.40
Nodes (5): Brand Identity (ELITE Nuvia), Liquid Glass CSS Effect (Global Class), Section 01: Hero — Cinematic Video Fullscreen, Section: Navbar (Liquid Glass Sticky), SVG Logo (ELITE Nuvia — ornamental key emblem)

### Community 4 - "Animation & 3D"
Cohesion: 0.50
Nodes (4): Framer Motion 11 (Animation Library), Section 06: Team / Agents Draggable Carousel, Section: Footer (4-column grid), WhatsApp FAB (Fixed Action Button)

### Community 5 - "UI Components"
Cohesion: 0.67
Nodes (3): Custom Spring Cursor (Desktop, gold circle), Responsiveness (Mobile/Tablet/Desktop breakpoints), Scroll Animations Map (whileInView, parallax, cursor)

### Community 6 - "Brand & Config"
Cohesion: 0.67
Nodes (3): Section 04: Services — Three.js 3D + Particles, SEO & Performance (Lighthouse >90, sitemap, robots), Three.js + @react-three/fiber + @react-three/drei

## Knowledge Gaps
- **6 isolated node(s):** `PostgreSQL 16 Database`, `Puppeteer PDF Generator (Headless Node)`, `TailwindCSS v3`, `Section 05: Animated Statistics Counters`, `Section: Footer (4-column grid)` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Framer Motion 11 (Animation Library)` connect `Animation & 3D` to `Backend Services`, `Public API`, `Page Sections`, `UI Components`, `Brand & Config`, `CRM & Auth`?**
  _High betweenness centrality (0.415) - this node is a cross-community bridge._
- **Why does `React Frontend (React 18 + Vite + TypeScript)` connect `Backend Services` to `Data Models`, `Public API`, `Animation & 3D`, `Brand & Config`?**
  _High betweenness centrality (0.278) - this node is a cross-community bridge._
- **Why does `API — Node.js 20 + Express 5` connect `Backend Services` to `Data Models`, `Public API`?**
  _High betweenness centrality (0.236) - this node is a cross-community bridge._
- **What connects `PostgreSQL 16 Database`, `Puppeteer PDF Generator (Headless Node)`, `TailwindCSS v3` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._