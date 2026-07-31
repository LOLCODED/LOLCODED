import type { RenderContext } from './context'
import { html, raw, renderToString } from './html'
import type { Html } from './html'

interface DocumentOptions {
  context: RenderContext
  title: string
  description: string

  path: string
  body: Html

  redirectLegacyHashes?: boolean

  imagePreview?: boolean
}

function legacyHashRedirect(base: string): Html {
  const target = JSON.stringify(base)
  return raw(
    `<script>var m=location.hash.match(/^#\\/([^/]+)\\/?$/);` +
      `if(m)location.replace(${target}+m[1]+"/")</script>`,
  )
}

export function documentHtml({
  context,
  title,
  description,
  path,
  body,
  redirectLegacyHashes = false,
  imagePreview = false,
}: DocumentOptions): string {
  const document = html`<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${redirectLegacyHashes ? legacyHashRedirect(context.base) : null}
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="color-scheme" content="dark" />
    <meta name="theme-color" content="#0a0a0a" />
    <link rel="icon" type="image/png" href="${context.faviconUrl}" />
    <link rel="canonical" href="${path}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta name="twitter:card" content="summary" />
    <style>${raw(context.css)}</style>
  </head>
  <body>
${body}
${imagePreview ? raw(`<script>${context.imagePreviewJs}</script>`) : null}
  </body>
</html>`

  return `<!doctype html>\n${renderToString(document)}\n`
}
