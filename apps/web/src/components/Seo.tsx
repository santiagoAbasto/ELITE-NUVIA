import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'ELITE Nuvia'
const SITE_URL = 'https://elitenuvia.bo'
const DEFAULT_IMAGE = `${SITE_URL}/og-cover.jpg`

interface SeoProps {
  title: string
  description: string
  path?: string
  image?: string
  noindex?: boolean
  jsonLd?: object | object[]
}

export function Seo({ title, description, path = '', image, noindex, jsonLd }: SeoProps) {
  const url = `${SITE_URL}${path}`
  const fullTitle = path === '' || path === '/' ? title : `${title} | ${SITE_NAME}`
  const ogImage = image ?? DEFAULT_IMAGE
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="es_BO" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}

export { SITE_NAME, SITE_URL }
