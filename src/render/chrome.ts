import { GITHUB_URL, GITHUB_USER } from '../data/repos'
import type { RenderContext } from './context'
import { externalLink, projectLink } from './components'
import { html } from './html'
import type { Html, Renderable } from './html'

export function siteBar(
  context: RenderContext,
  { middle, back = false }: { middle?: Renderable; back?: boolean } = {},
): Html {
  return html`<header class="site-bar">
    ${back
      ? projectLink(context, null, 'site-mark', html`← ${GITHUB_USER}`)
      : html`<span class="site-mark">${GITHUB_USER}</span>`}
    ${middle ? html`<span class="site-bar-mid">${middle}</span>` : null}
    ${externalLink(GITHUB_URL, 'site-bar-link', 'GITHUB ↗')}
  </header>`
}

export function siteFooter(year: number): Html {
  return html`<footer class="site-footer">
    <span>© ${year} ${GITHUB_USER}</span>
    ${externalLink(GITHUB_URL, '', html`GITHUB.COM/${GITHUB_USER}`)}
  </footer>`
}
