import { PrismaClient, TipoOperacion, TipoInmueble, Rol } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding ELITE Nuvia database...')

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

  await prisma.foto.createMany({
    skipDuplicates: true,
    data: [
      { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', urlThumb: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_400/sample.jpg', orden: 0, propiedadId: prop1.id },
      { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', urlThumb: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_400/sample.jpg', orden: 0, propiedadId: prop2.id },
      { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', urlThumb: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_400/sample.jpg', orden: 0, propiedadId: prop3.id },
    ],
  })

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
