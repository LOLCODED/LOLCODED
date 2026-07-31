import type { RenderContext } from './context'
import { hrefFor } from './context'
import { html } from './html'
import type { Html, Renderable } from './html'

export function projectLink(
  context: RenderContext,
  slug: string | null,
  className: string,
  children: Renderable,
): Html {
  return html`<a href="${hrefFor(context, slug)}" class="${className}">${children}</a>`
}

export function externalLink(url: string, className: string, children: Renderable): Html {
  return html`<a
    href="${url}"
    target="_blank"
    rel="noreferrer"
    class="${className}"
  >${children}</a>`
}
