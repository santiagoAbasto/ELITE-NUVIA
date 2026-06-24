export interface CmsSectionMeta {
  label: string
  shortLabel: string
  description: string
  publicPath: string
  publicLabel: string
}

export const CMS_SECTION_META: Record<string, CmsSectionMeta> = {
  home: {
    label: 'Inicio — Hero',
    shortLabel: 'Inicio',
    description: 'Video, titular, subtítulo y llamada principal.',
    publicPath: '/',
    publicLabel: 'Portada pública',
  },
  propiedades: {
    label: 'Propiedades',
    shortLabel: 'Propiedades',
    description: 'Encabezado, filtros y textos del listado público.',
    publicPath: '/propiedades',
    publicLabel: 'Listado público',
  },
  agentes: {
    label: 'Agentes',
    shortLabel: 'Agentes',
    description: 'Bloque público del equipo y CTA asociado.',
    publicPath: '/nosotros#agentes',
    publicLabel: 'Equipo público',
  },
  servicios: {
    label: 'Servicios',
    shortLabel: 'Servicios',
    description: 'Venta, alquiler, anticretico y textos comerciales.',
    publicPath: '/servicios',
    publicLabel: 'Página de servicios',
  },
  nosotros: {
    label: 'Nosotros',
    shortLabel: 'Nosotros',
    description: 'Misión, historia, valores y métricas públicas.',
    publicPath: '/nosotros',
    publicLabel: 'Página institucional',
  },
  contacto: {
    label: 'Contacto',
    shortLabel: 'Contacto',
    description: 'Datos de contacto, WhatsApp, mapa y horarios.',
    publicPath: '/contacto',
    publicLabel: 'Página de contacto',
  },
  footer: {
    label: 'Footer',
    shortLabel: 'Footer',
    description: 'Descripción, links, redes sociales y texto legal.',
    publicPath: '/',
    publicLabel: 'Footer del sitio',
  },
}

export const DEFAULT_CMS_DATA: Record<string, Record<string, unknown>> = {
  home: {
    badgeTexto: 'Inmobiliaria Premium Bolivia',
    titulo: 'Tu hogar ideal, nuestra pasion.',
    subtitulo: 'Venta · Alquiler · Anticretico\nCochabamba · Santa Cruz · La Paz · Oruro',
    ctaTexto: 'Explorar propiedades',
    ctaUrl: '/propiedades',
    videoUrl: '/hero.mp4',
  },
  propiedades: {
    eyebrow: 'Inmuebles',
    titulo: 'Todas las Propiedades',
    subtitulo: 'Venta, alquiler y anticretico en Cochabamba, Santa Cruz, La Paz y Oruro.',
    emptyTitulo: 'Sin resultados',
    emptyTexto: 'No encontramos propiedades con esos filtros. Intenta con otros criterios.',
    ctaTexto: 'Ver todas las propiedades',
    ctaUrl: '/propiedades',
    operaciones: [
      { id: 'todos', label: 'Todos', value: '' },
      { id: 'venta', label: 'En Venta', value: 'VENTA' },
      { id: 'alquiler', label: 'En Alquiler', value: 'ALQUILER' },
      { id: 'anticretico', label: 'Anticretico', value: 'ANTICRETICO' },
    ],
    tipos: ['Casa', 'Departamento', 'Garzonier', 'Terreno', 'Local comercial'],
    ciudades: ['Cochabamba', 'Santa Cruz', 'La Paz', 'Oruro'],
  },
  agentes: {
    eyebrow: 'Nuestro equipo',
    titulo: 'Un equipo comprometido contigo',
    subtitulo: 'Profesionales con anos de experiencia en el mercado inmobiliario boliviano. Arrastra para ver mas.',
    ctaTexto: 'Conocer agentes',
    ctaUrl: '/nosotros#agentes',
    gestionNota: 'Los perfiles, fotos y métricas de agentes se gestionan desde CRM > Agentes.',
  },
  servicios: {
    titulo: 'Nuestros Servicios',
    subtitulo: 'Soluciones inmobiliarias a tu medida. Respaldo y confianza en cada etapa de tu vida.',
    servicios: [
      {
        id: 'venta',
        titulo: 'Venta',
        descripcion: 'Vendemos tu propiedad al mejor precio del mercado. Valuacion gratuita, fotografia profesional y maxima exposicion digital en todas las plataformas.',
        imagenUrl: '',
      },
      {
        id: 'alquiler',
        titulo: 'Alquiler',
        descripcion: 'Encuentra el inmueble perfecto o alquila el tuyo con respaldo total. Gestion de contratos, garantias y seguimiento mensual incluidos.',
        imagenUrl: '',
      },
      {
        id: 'anticretico',
        titulo: 'Anticretico',
        descripcion: 'Modalidad exclusiva de Bolivia. Entrega un monto y vive en la propiedad por el tiempo acordado sin pagar renta mensual. Al finalizar, recuperas tu inversion.',
        imagenUrl: '',
      },
    ],
  },
  nosotros: {
    mision: 'ELITE Nuvia nació con la misión de hacer que encontrar tu hogar ideal sea una experiencia transparente, profesional y sin complicaciones. Hoy somos el referente inmobiliario en 4 ciudades bolivianas.',
    timeline: [
      { id: '2016', anio: '2016', texto: 'Fundación en Cochabamba con 3 asesores especializados.' },
      { id: '2018', anio: '2018', texto: 'Expansión a Santa Cruz y La Paz.' },
      { id: '2020', anio: '2020', texto: 'Plataforma digital y CRM propio.' },
      { id: '2023', anio: '2023', texto: 'Llegamos a Oruro. 4 ciudades, 1 equipo.' },
      { id: '2025', anio: '2025', texto: '+200 familias. Nuevas metas.' },
    ],
    stats: [
      { id: 'familias', numero: '+200', etiqueta: 'familias asesoradas' },
      { id: 'ciudades', numero: '4', etiqueta: 'ciudades en Bolivia' },
      { id: 'experiencia', numero: '+8', etiqueta: 'anos de experiencia' },
      { id: 'servicios', numero: '3', etiqueta: 'modalidades inmobiliarias' },
    ],
  },
  contacto: {
    telefono: '+591 4 000 0000',
    whatsapp: '+591 70000000',
    email: 'info@elitenuvia.bo',
    direccion: 'Cochabamba, Bolivia',
    mapUrl: '',
    horario: 'Lunes a viernes de 09:00 a 18:30. Sábados con cita previa.',
  },
  footer: {
    descripcion: 'Tu hogar, tu futuro, nuestra prioridad. Inmobiliaria de excelencia en Bolivia con mas de 8 anos conectando familias con su hogar ideal.',
    links: [
      { id: 'venta', label: 'En venta', url: '/propiedades?tipo=VENTA' },
      { id: 'alquiler', label: 'En alquiler', url: '/propiedades?tipo=ALQUILER' },
      { id: 'anticretico', label: 'Anticretico', url: '/propiedades?tipo=ANTICRETICO' },
      { id: 'terrenos', label: 'Terrenos', url: '/propiedades?tipoInmueble=TERRENO' },
      { id: 'locales', label: 'Locales', url: '/propiedades?tipoInmueble=LOCAL' },
    ],
    socialInstagram: '',
    socialFacebook: '',
    socialWhatsapp: '59170000000',
    textoLegal: '© 2025 ELITE Nuvia. Todos los derechos reservados.',
  },
}

export function withCmsDefaults(seccion: string, datos: Record<string, unknown>) {
  return {
    ...(DEFAULT_CMS_DATA[seccion] ?? {}),
    ...datos,
  }
}
