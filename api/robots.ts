export default async function handler(req: any, res: any) {
  try {
    const host = (req.headers?.host as string) || 'legacyguard.cz'

    // Env detection: prefer Vercel indicator and explicit production flag per project rule
    const vercelEnv = process.env.VERCEL_ENV // 'production' | 'preview' | 'development'
    const isProdFlag = process.env.VITE_IS_PRODUCTION === 'true' || process.env.NEXT_PUBLIC_IS_PRODUCTION === 'true'
    const isProd = (vercelEnv === 'production' || process.env.NODE_ENV === 'production') && isProdFlag

    let body = ''
    let cacheControl = ''

    if (isProd) {
      // Allow all in production
      body = `User-agent: *\nDisallow:\nSitemap: https://${host}/sitemap.xml\n`
      cacheControl = 'public, max-age=600' // 10 minutes
      res.setHeader('X-Robots-Tag', 'index, follow')
    } else {
      // Disallow in staging/preview/dev
      body = 'User-agent: *\nDisallow: /\n'
      cacheControl = 'no-store'
      res.setHeader('X-Robots-Tag', 'noindex, nofollow')
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Cache-Control', cacheControl)
    res.status(200).send(body)
  } catch (e: any) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.status(500).send('User-agent: *\nDisallow: /\n')
  }
}