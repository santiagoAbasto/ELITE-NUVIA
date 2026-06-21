# ELITE Nuvia — Sitio Publico: Design Spec
**Fecha:** 2026-06-21  
**Alcance:** Sub-sistema 1 de 4 — Sitio Web Publico  
**Estado:** Aprobado por cliente

---

## 1. Identidad de Marca

### Paleta de colores
```
--green-deep:  #0A2416   (fondo oscuro, footer, hero bg)
--green-main:  #0D3B27   (primario, navbar solido, botones)
--green-mid:   #1a5c3a   (variante intermedia, acentos)
--gold:        #C9A84C   (acento dorado, CTAs, highlights)
--gold-light:  #E8C96A   (hover dorado, iconos activos)
--cream:       #F5F0E6   (fondo secciones claras)
--cream-dark:  #EDE8DC   (cards, hover states)
--white:       #FFFFFF
--text-dark:   #111810
--text-mid:    #4a5240
--text-muted:  #8a9080
```

### Tipografia
- **ELITE** — Inter 800, letter-spacing: 4px, uppercase
- **Nuvia** — Playfair Display 400 italic, color gold
- **Headlines** — Inter 700–800, letter-spacing: -0.02em a -0.04em
- **Cuerpo** — Inter 300–500
- **Labels/tags** — Inter 600, letter-spacing: 2–3px, uppercase

### Taglines aprobados
- Principal: "TU HOGAR, NUESTRA PASION"
- Secundario: "TU HOGAR, TU FUTURO, NUESTRA PRIORIDAD"
- Equipo: "UN EQUIPO COMPROMETIDO CONTIGO, CUMPLIENDO SUENOS"

### Servicios
Venta · Alquiler · Anticretico  
Tipos: Casas · Departamentos · Garzoniers · Terrenos · Locales comerciales

---

## 2. Arquitectura Tecnica

### Stack completo — Sitio Publico
```
Frontend:    React 18 + Vite + TypeScript
Estilos:     TailwindCSS v3 (fontFamily: Inter)
Animacion:   Framer Motion 11
3D:          Three.js + @react-three/fiber + @react-three/drei
Mapa:        Leaflet.js + React-Leaflet
Fuentes:     Google Fonts (Inter + Playfair Display)
PDF:         Puppeteer (Node side) — spec separado
Imagenes:    Cloudinary (upload + transformaciones)
Video hero:  Higgsfield AI — generado antes del deploy
```

### Stack completo — API / Backend
```
Runtime:     Node.js 20 LTS
Framework:   Express 5
ORM:         Prisma 5 + PostgreSQL 16
Auth:        JWT (httpOnly cookie, 8h) + Refresh token (30d)
Storage:     Cloudinary (fotos) + CloudFront CDN (video)
PDF:         Puppeteer headless
Rate limit:  express-rate-limit (5 req/15min en /auth/login)
CORS:        Solo origen del sitio publico
```

### Estructura de directorios
```
/ELITE
  /apps
    /web          ← React + Vite (sitio publico)
    /crm          ← Angular (privado, spec separado)
    /api          ← Node + Express
  /packages
    /ui           ← componentes compartidos
    /types        ← TypeScript types compartidos
  /docs
    /superpowers/specs
```

### Routing del servidor unico — Puerto 8080
```
/                          → React build (publico, indexable)
/propiedades               → React SPA
/propiedades/:slug         → React SPA
/agentes/:slug             → React SPA
/servicios                 → React SPA
/nosotros                  → React SPA
/contacto                  → React SPA
/ELITE-CRM/ADMIN/login     → Angular build (oculto)
/ELITE-CRM/ADMIN/*         → Angular build (protegido JWT)
/api/v1/*                  → Express API
```

**Seguridad del CRM:**
- Ruta no aparece en `robots.txt` ni en `sitemap.xml`
- Ningun link desde el sitio publico apunta al CRM
- `express.static()` sirve el Angular build solo desde `/ELITE-CRM/ADMIN/`
- Angular `AuthGuard` redirige a `/login` si no hay JWT valido
- JWT en `httpOnly` cookie — inaccesible desde JavaScript (proteccion XSS)
- Rate limiting en `/api/v1/auth/login`: max 5 intentos/IP/15min

---

## 3. Layout Global

### Container
```css
.wrap {
  width: 100%;
  max-width: 1366px;   /* 1224px contenido + 71px*2 padding */
  margin: 0 auto;
  padding: 0 71px;
}
```
Todo el contenido vive dentro de `.wrap`. Los fondos de seccion son full-width, el contenido siempre centrado en 1224px.

### Liquid Glass (clase global)
```css
.liquid-glass {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
}
.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 20%,
    rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.1) 80%, rgba(255,255,255,0.3) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box,
                linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

---

## 4. Seccion por Seccion

### NAV — Navbar Liquid Glass Sticky

**Comportamiento scroll:**
- 0–50px: `background: transparent` + `backdrop-filter: blur(0)`
- >50px: `background: rgba(8,14,9,0.72)` + `backdrop-filter: blur(18px)` + `border-bottom: 1px solid rgba(201,168,76,0.08)`
- Transicion: Framer Motion `useScroll` + `useMotionValueEvent`

**Componentes:**
- Izquierda: Logo SVG (icono llave + "ELITE" + "Nuvia" italic dorado)
- Centro: Links `Propiedades | Servicios | Agentes | Nosotros | Contacto`
  - Hover: color transition a `#C9A84C` con underline dorado que crece desde centro
- Derecha: Telefono en texto + boton "WhatsApp" con borde dorado
- Mobile (<768px): hamburger → Drawer lateral con `AnimatePresence` slide-from-right

**Animacion entrada:**
```tsx
// Navbar aparece con slide-down al cargar la pagina
initial={{ y: -100, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
```

---

### 01 — HERO: Video Cinematico Fullscreen

**Video:**
- Fuente: Higgsfield AI — prompt: "Luxury real estate Bolivia aerial cinematic slow motion, modern house with pool, golden hour light, camera gliding forward, 4K"
- Tag: `<video autoPlay loop muted playsInline` `style={{ objectFit: 'cover' }}`
- Sin overlay oscuro. Sin gradiente sobre el video.
- Solo fade en la parte inferior: `background: linear-gradient(0deg, rgba(8,14,9,0.85) 0%, transparent 60%)`

**Estructura layout hero:**
```
[         VIDEO FULLSCREEN BG         ]
[                                     ]
[   ← contenido push to bottom →     ]
[ EYEBROW                             ]
[ HEADLINE grande                     ]
[ SUBHEADLINE                         ]
[ [BTN Explorar]  [BTN WhatsApp]      ]  [TAG CARD floating]
```

**AnimatedHeading — char by char:**
```tsx
// Headline: "Tu hogar ideal," / "nuestra pasion."
// charDelay = 30ms, linea 2 empieza cuando termina linea 1
// Cada char: opacity 0→1, translateX -18px→0
// Duracion por char: 500ms, ease spring
const charDelay = (lineIndex * lineChars * 30) + (charIndex * 30) + 200
```

**Animaciones (Framer Motion):**
```
Eyebrow:    fadeIn delay=100ms  duration=600ms
Headline:   char-by-char desde delay=200ms
Subheadline:fadeIn delay=900ms  duration=800ms
Botones:    fadeIn delay=1200ms duration=800ms  + slideUp 20px
Tag card:   fadeIn delay=1400ms duration=800ms
```

**Tag card (liquid glass):**
- Muestra conteo de disponibles: Venta X · Alquiler X · Anticretico X
- Ciudades como chips: Cochabamba · Santa Cruz · La Paz · Oruro
- Datos en tiempo real desde `/api/v1/propiedades/count`

**Scroll indicator:**
- Punto con rebote infinito (Framer `animate={{ y: [0, 8, 0] }}` `repeat: Infinity`)
- Desaparece al scrollear >100px

---

### 02 — BUSCADOR AVANZADO + MAPA

**Panel flotante:**
- `margin-top: -50px` sobre el hero — efecto de superposicion
- `box-shadow: 0 24px 80px rgba(0,0,0,0.13)`
- Animacion entrada: `whileInView={{ opacity:1, y:0 }}` desde `{ opacity:0, y:40 }`

**Tabs Venta / Alquiler / Anticretico:**
- Cambio de tab: Framer `layoutId="tab-indicator"` para pill animada

**Campos:**
1. Ciudad (select): Cochabamba · Santa Cruz · La Paz · Oruro
2. Tipo de inmueble (select): Casa · Departamento · Garzonier · Terreno · Local
3. Precio maximo (input + slider Radix)
4. Dormitorios (select): Cualquiera · 1 · 2 · 3 · 4+
5. Banos (select): Cualquiera · 1 · 2 · 3+
6. Boton Buscar (verde oscuro, texto dorado)

**Expandible "Mas filtros":**
- Superficie m2 (range slider)
- Garage (checkbox)
- Amueblado (checkbox)
- Piscina (checkbox)
- Animacion: `AnimatePresence` con `height: 0 → auto`

**Mapa Leaflet:**
- Tiles: CartoDB Positron (estilo limpio, sin colores llamativos)
- Pins personalizados: SVG con los colores de ELITE Nuvia
- Cluster de pins cuando hay >5 propiedades cercanas
- Click en pin: popup con mini-card de la propiedad
- Altura: 280px en desktop

**API:** `GET /api/v1/propiedades?tipo=venta&ciudad=cochabamba&precioMax=500000`

---

### 03 — PROPIEDADES DESTACADAS

**Layout:** grilla 3 columnas, gap 22px, dentro del wrap 1224px

**Property Card — especificacion:**
```
[  IMAGEN 200px height                    ]
[  [BADGE tipo]              [♡ guardar]  ]
[  ● ubicacion ciudad                     ]
[─────────────────────────────────────────]
[  Bs. 380,000                            ]
[  precio negociable                      ]
[  Casa residencial de 3 plantas...       ]
[  ┌─────┬─────┬─────┬─────┐             ]
[  │  3  │  2  │ 180 │ Si  │             ]
[  │Dorm.│Bano │ m²  │Gge. │             ]
[  └─────┴─────┴─────┴─────┘             ]
[  [LB avatar] Litzi Barbeito   [W]       ]
```

**Badges:**
- Venta: `background: #C9A84C; color: #0A2416`
- Alquiler: `background: #0D3B27; color: #C9A84C; border: 1px solid #C9A84C`
- Anticretico: `background: rgba(255,255,255,0.12); backdrop-filter: blur(4px); color: #fff`
- Nuevo: `background: #fff; color: #0A2416` — solo si `createdAt < 7 dias`

**Animaciones Framer Motion:**
```tsx
// Stagger cards al entrar en viewport
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}
const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22,1,0.36,1] } }
}
// whileInView con viewport={{ once: true, margin: "-80px" }}
```

**Hover card:**
```tsx
whileHover={{ y: -4, boxShadow: "0 20px 60px rgba(0,0,0,0.14)" }}
transition={{ duration: 0.25 }}
```

**Boton guardar (corazon):**
- Toggle con Framer `animate={{ scale: [1, 1.3, 1] }}` al activar
- Color: rojo si guardado, gris si no

**Paginacion / CTA:** boton "Ver todas las propiedades" centrado debajo de la grilla

---

### 04 — SERVICIOS: Three.js 3D + Particulas

**Fondo:** `background: #0A2416` con dos radial-gradients gold sutiles

**Efecto 3D Three.js — Canvas absoluto en el fondo:**
```tsx
// @react-three/fiber canvas, posicion absolute, z-index 0
// Particulas doradas flotantes: ~200 esferas tiny (r=0.02)
// Posicion: random en espacio 3D [-10, 10]
// Movimiento: rotacion lenta del grupo + drift vertical sin fin
// Color: #C9A84C con emissive glow
// Sin interaccion — solo decorativo
const particles = useMemo(() => {
  return Array.from({ length: 200 }, () => ({
    position: [
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
    ] as [number, number, number],
    speed: Math.random() * 0.3 + 0.1,
  }))
}, [])
```

**Cards de servicios — Flip 3D al hover:**
```css
.svc-card { transform-style: preserve-3d; }
.svc-card:hover { transform: rotateY(3deg) rotateX(-2deg); }
/* Framer whileHover con rotateX y rotateY */
```

**Animacion entrada seccion:**
- Header: `whileInView fadeIn + slideUp` delay escalonado
- Cards: stagger 0.15s entre cada una, desde `y: 48, opacity: 0`

**Cards internas:**
- Icono en caja con borde dorado semitransparente
- Top line: gradiente horizontal `transparent → gold → transparent`
- Badge "Three.js 3D" en esquina superior derecha
- Anticretico: tooltip "Como funciona?" con Framer `AnimatePresence`

---

### 05 — ESTADISTICAS ANIMADAS

**Fondo:** gradient horizontal `#0D3B27 → #0A2416`

**Contadores animados:**
```tsx
// useCountUp hook — cuenta de 0 al valor final cuando entra en viewport
// Duracion: 2000ms, ease: easeOut
// Trigger: useInView de Framer con once:true

function useCountUp(target: number, duration = 2000, inView: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])
  return count
}
```

**Valores:**
- `+500` Propiedades gestionadas
- `+8` Anos de experiencia
- `+200` Familias satisfechas
- `4` Ciudades en Bolivia

**Separador:** `border-left: 1px solid rgba(201,168,76,0.15)` entre cada stat

---

### 06 — EQUIPO / AGENTES

**Fondo:** `#F5F0E6` (cream)

**Carrusel draggable:**
```tsx
<motion.div
  drag="x"
  dragConstraints={containerRef}
  style={{ cursor: 'grab' }}
  whileDrag={{ cursor: 'grabbing' }}
>
  {agentes.map(agente => <AgentCard key={agente.id} {...agente} />)}
</motion.div>
```

**Agent Card:**
```
[  Avatar 76px circular con borde gold  ]
[  • indicador verde online             ]
[  Nombre                               ]
[  Asesora Inmobiliaria                 ]
[─────────────────────────────────────  ]
[  12 propiedades activas               ]
[  [W Contactar]                        ]
```

**Hover:**
```tsx
whileHover={{
  y: -4,
  boxShadow: "0 12px 40px rgba(201,168,76,0.15)",
  borderColor: "rgba(201,168,76,0.5)"
}}
```

**API:** `GET /api/v1/agentes?publico=true` — solo agentes con perfil activo

**Perfil publico agente:** `/agentes/:slug` — lista sus propiedades activas + foto + bio + WhatsApp

---

### 07 — TESTIMONIOS

**Auto-slide:**
```tsx
useEffect(() => {
  const interval = setInterval(() => {
    setActive(prev => (prev + 1) % testimonios.length)
  }, 5500)
  return () => clearInterval(interval)
}, [])
```

**Transicion entre testimonios:**
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeIndex}
    initial={{ opacity: 0, x: 40 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -40 }}
    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
  >
    <TestimonioCard {...testimonios[activeIndex]} />
  </motion.div>
</AnimatePresence>
```

**Card:**
- Comilla decorativa 96px `Playfair Display 900` color gold al 8% opacidad
- Estrellas: 5 estrellas gold
- Badge de tipo de operacion (VENTA / ALQUILER / ANTICRETICO) top-right
- Dots indicadores abajo — dot activo = pill ancho 28px dorado

**API:** testimonios se cargan desde `/api/v1/testimonios` o hardcoded inicialmente

---

### FTR — FOOTER

**Fondo:** `#060e08` (mas oscuro que el hero)

**Grid 4 columnas:**
- Col 1 (2x): Logo + descripcion + redes sociales
- Col 2: Links Propiedades
- Col 3: Links Empresa
- Col 4: Contacto (tel, ciudad, email, WhatsApp CTA dorado)

**Sin ninguna referencia al CRM.** Ningun link, ningun boton, ningun texto.

**Slogan footer:** "TU HOGAR, NUESTRA PASION" — dorado, letra-spacing 3px

**FAB WhatsApp:**
- Fijo `position: fixed; bottom: 30px; right: 30px`
- `box-shadow: 0 4px 24px rgba(37,211,102,0.45)`
- Framer: entrada con `scale: 0 → 1` delay 2000ms
- Tooltip "Hablar con un agente" en hover con `AnimatePresence`
- Click: abre `wa.me/{WHATSAPP_PRINCIPAL}` — numero configurado en variable de entorno `VITE_WA_NUMBER`

---

## 5. Animaciones de Scroll — Mapa Completo

### Filosofia
Cada seccion tiene su propia "entrada" al scrollear. Se usa `whileInView` de Framer con `viewport={{ once: true, margin: "-100px" }}` para que la animacion ocurra una sola vez cuando la seccion entra en pantalla.

### Por seccion
```
NAV         → slideDown al cargar, solidifica al scrollear >50px
HERO        → animacion interna inmediata al cargar (no scroll)
BUSCADOR    → slideUp 40px + opacity al hacer scroll desde hero
PROPIEDADES → stagger cards 0.1s cada una, fadeUp
SERVICIOS   → header fadeIn, luego cards stagger 0.15s
STATS       → contadores arrancan al entrar en viewport
AGENTES     → header fadeUp, carrusel slideIn desde derecha
TESTIMONIOS → fadeIn suave
FOOTER      → fadeIn opacity simple
```

### Efecto Parallax Hero → Buscador
```tsx
const { scrollY } = useScroll()
const heroScale = useTransform(scrollY, [0, 500], [1, 1.08])
const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
// Video hace zoom lento al scrollear
```

### Cursor personalizado (desktop)
```tsx
// Circulo dorado 32px que sigue el cursor con spring lag
// Dentro de property cards: muestra "VER"
// Dentro de agent cards: muestra "PERFIL"
const springConfig = { stiffness: 400, damping: 28 }
const cursorX = useSpring(mouseX, springConfig)
const cursorY = useSpring(mouseY, springConfig)
```

---

## 6. Generacion de Video con Higgsfield

Antes del deploy, generar el video hero con Higgsfield:

**Prompt sugerido:**
```
Cinematic luxury real estate aerial video Bolivia,
modern white house with pool and garden at golden hour,
slow dolly forward camera movement, warm sunlight,
Cochabamba mountains in background, ultra high quality,
no text, no watermarks, 16:9 aspect ratio, 10 seconds
```

**Especificaciones:**
- Duracion: 10–15 segundos (loop sin corte visible)
- Resolucion: 1920x1080 minimo / 4K ideal
- Formato: MP4 H.264 para web
- Sin audio (muted)
- Subir a CloudFront CDN para streaming sin latencia
- Fallback: imagen estatica mientras carga el video

---

## 7. SVG Logo ELITE Nuvia

El logo debe reconstruirse como SVG vectorial basado en las imagenes de referencia:

**Estructura del emblema:**
- Circulo exterior con linea delgada gold
- Circulo interior con linea mas delgada gold
- Elemento central: llave ornamental con:
  - Cabeza circular con ojo romboidal
  - Caña vertical recta
  - 2 dientes laterales en la parte baja
- Ornamentos laterales: formas en media luna que simulan llaves cruzadas
- Abajo del emblema: texto "ELITE" uppercase bold + "Nuvia" italic script

**Colores SVG:**
- Sobre fondo claro: `stroke="#0D3B27"` + acento `fill="#C9A84C"`
- Sobre fondo oscuro: `stroke="#C9A84C"` + texto `fill="#FFFFFF"`

---

## 8. Base de Datos — Modelo de Datos (Prisma)

```prisma
model Propiedad {
  id          String   @id @default(cuid())
  slug        String   @unique
  titulo      String
  descripcion String
  tipo        TipoOperacion  // VENTA | ALQUILER | ANTICRETICO
  tipoInmueble TipoInmueble // CASA | DEPARTAMENTO | GARZONIER | TERRENO | LOCAL
  precio      Decimal
  moneda      String   @default("BOB")
  ciudad      String
  zona        String?
  direccion   String?
  dormitorios Int?
  banos       Int?
  superficieM2 Decimal?
  garage      Boolean  @default(false)
  amueblado   Boolean  @default(false)
  piscina     Boolean  @default(false)
  fotos       Foto[]
  agenteId    String
  agente      Agente   @relation(fields: [agenteId], references: [id])
  destacada   Boolean  @default(false)
  activa      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Agente {
  id          String   @id @default(cuid())
  slug        String   @unique
  nombre      String
  apellido    String
  email       String   @unique
  telefono    String
  whatsapp    String
  foto        String?  // Cloudinary URL
  bio         String?
  activo      Boolean  @default(true)
  propiedades Propiedad[]
  user        User?
}

model Foto {
  id           String    @id @default(cuid())
  url          String    // Cloudinary URL
  urlThumb     String    // Cloudinary thumbnail
  orden        Int       @default(0)
  propiedadId  String
  propiedad    Propiedad @relation(fields: [propiedadId], references: [id])
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hash
  rol       Rol      // SUPER_ADMIN | AGENTE | COORDINADOR
  agenteId  String?  @unique
  agente    Agente?  @relation(fields: [agenteId], references: [id])
  activo    Boolean  @default(true)
  createdAt DateTime @default(now())
}

model Testimonio {
  id        String   @id @default(cuid())
  nombre    String
  ciudad    String
  texto     String
  rating    Int      @default(5)
  tipo      TipoOperacion
  foto      String?
  activo    Boolean  @default(true)
}

enum TipoOperacion { VENTA ALQUILER ANTICRETICO }
enum TipoInmueble  { CASA DEPARTAMENTO GARZONIER TERRENO LOCAL OTRO }
enum Rol           { SUPER_ADMIN AGENTE COORDINADOR }
```

---

## 9. API Endpoints — Sitio Publico

```
GET  /api/v1/propiedades              → listado paginado (filtros por query params)
GET  /api/v1/propiedades/count        → conteo por tipo (para hero tag card)
GET  /api/v1/propiedades/destacadas   → top 6 propiedades destacadas=true
GET  /api/v1/propiedades/:slug        → detalle de una propiedad
GET  /api/v1/agentes                  → todos los agentes activos publicos
GET  /api/v1/agentes/:slug            → perfil publico + propiedades del agente
GET  /api/v1/testimonios              → testimonios activos
```

Todos los endpoints publicos no requieren autenticacion.  
Cache: `Cache-Control: public, max-age=60` en listados, `max-age=300` en conteos.

---

## 10. Performance y SEO

- `<title>` y `<meta description>` dinamicos por pagina
- `<link rel="canonical">` en todas las paginas
- `sitemap.xml` generado desde la API (solo rutas publicas, NUNCA `/ELITE-CRM/`)
- `robots.txt` bloquea: `Disallow: /ELITE-CRM/`
- Open Graph tags para compartir en redes sociales
- Lazy loading de imagenes con `loading="lazy"` y Cloudinary responsive URLs
- Video hero: `preload="none"` — carga despues del LCP
- Three.js canvas: solo se inicializa si `window.matchMedia('(min-width: 768px)')` — en mobile se usa un gradiente animado en CSS en su lugar
- Lighthouse target: Performance >90, Accessibility >95

---

## 11. Responsividad

```
Mobile:  < 768px
Tablet:  768px – 1024px
Desktop: > 1024px
Wide:    > 1366px (wrap centra con margen auto)
```

**Mobile adjustments:**
- Navbar: hamburger drawer
- Hero headline: 42px (en vez de 68px)
- Search: stack vertical (1 columna)
- Props grid: 1 columna
- Services grid: 1 columna
- Stats: 2x2 grid
- Agents: scroll horizontal igual que desktop
- Three.js: desactivado, reemplazado por CSS gradient animado
- Cursor personalizado: desactivado en touch

---

## 12. Fases de Implementacion (orden sugerido para writing-plans)

1. **Setup monorepo** — Vite, TailwindCSS, TypeScript, ESLint, paths
2. **Backend base** — Express, Prisma, PostgreSQL, modelos, seeds
3. **API publica** — endpoints de propiedades, agentes, testimonios
4. **Componentes globales** — Layout, Navbar, Footer, FAB WhatsApp, Logo SVG
5. **Hero section** — Video bg, AnimatedHeading, animaciones entrada, tag card
6. **Buscador** — Panel, tabs animados, campos, Leaflet mapa
7. **Propiedades** — Grid, PropertyCard, paginacion
8. **Servicios** — Three.js canvas, cards flip 3D, stagger
9. **Stats** — useCountUp, whileInView
10. **Agentes** — carrusel draggable, perfil publico
11. **Testimonios** — auto-slide, AnimatePresence
12. **Scroll animations** — parallax, cursor personalizado, polish global
13. **SEO** — meta tags, sitemap, robots.txt
14. **Video Higgsfield** — generar y subir a CDN
15. **Deploy** — servidor unico puerto 8080, nginx reverse proxy

---

*Spec aprobado. Sub-sistema 2 (CRM Angular) se especificara en un documento separado.*
