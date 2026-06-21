import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

export const sitemapRouter = Router()

sitemapRouter.get('/robots.txt', (_req, res) => {
  res.type('text/plain')
  res.send([
    'User-agent: *',
    'Allow: /',
    'Disallow: /ELITE-CRM/',
    'Disallow: /api/',
    '',
    'Sitemap: https://elitenuvia.bo/sitemap.xml',
  ].join('\n'))
})

sitemapRouter.get('/sitemap.xml', async (_req, res, next) => {
  try {
    const propiedades = await prisma.propiedad.findMany({
      where: { activa: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })

    const agentes = await prisma.agente.findMany({
      where: { activo: true },
      select: { slug: true, updatedAt: true },
    })

    const base = 'https://elitenuvia.bo'
    const now = new Date().toISOString().split('T')[0]

    const staticRoutes = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/propiedades', priority: '0.9', changefreq: 'daily' },
      { url: '/servicios', priority: '0.7', changefreq: 'monthly' },
      { url: '/nosotros', priority: '0.6', changefreq: 'monthly' },
      { url: '/contacto', priority: '0.6', changefreq: 'monthly' },
    ]

    const urls = [
      ...staticRoutes.map(r => `
  <url>
    <loc>${base}${r.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`),
      ...propiedades.map(p => `
  <url>
    <loc>${base}/propiedades/${p.slug}</loc>
    <lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`),
      ...agentes.map(a => `
  <url>
    <loc>${base}/agentes/${a.slug}</loc>
    <lastmod>${a.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`),
    ]

    res.type('application/xml')
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`)
  } catch (err) { next(err) }
})
