import { repos } from '../data/repos'
import type { Repo } from '../data/repos'
import type { RenderContext } from '../render/context'
import { siteBar, siteFooter } from '../render/chrome'
import { projectLink } from '../render/components'
import { html } from '../render/html'
import { documentHtml } from '../render/layout'
import type { Html } from '../render/html'

const DESCRIPTION =
  'LOLCODED — browser extensions and small, self-hostable apps. Open source, dark by default.'

function card(context: RenderContext, repo: Repo, index: number): Html {
  return projectLink(
    context,
    repo.slug,
    'site-cell site-cell--link bt-card',
    html`<div class="bt-card-top">
      <span class="bt-num">${String(index + 1).padStart(2, '0')}</span>
      <span class="bt-kind">${repo.kind.toUpperCase()}</span>
    </div>
    <h2 class="bt-card-name">${repo.name}</h2>
    <p class="bt-card-tagline">${repo.tagline}</p>
    <p class="bt-card-desc">${repo.description}</p>
    <ul class="bt-tech">
      ${repo.tech.map((tech) => html`<li>${tech}</li>`)}
    </ul>
    <span class="bt-card-cta">OPEN PROJECT →</span>`,
  )
}

export function renderIndexPage(context: RenderContext, year: number): string {
  const body = html`<div class="site">
      ${siteBar(context, { middle: `${repos.length} REPOS / 0 DEPENDENCIES ON YOU` })}

      <section class="site-hero">
        <h1 class="site-title">LOL<span class="site-title-accent">CODED</span></h1>
        <p class="site-lede">
          Browser extensions and small self-hostable apps. Built in TypeScript,
          shipped as source, themed like a terminal.
        </p>
      </section>

      <section class="site-grid">
        ${repos.map((repo, index) => card(context, repo, index))}
      </section>

      ${siteFooter(year)}
    </div>`

  return documentHtml({
    context,
    title: 'LOLCODED',
    description: DESCRIPTION,
    path: context.base,
    body,
    redirectLegacyHashes: true,
  })
}
