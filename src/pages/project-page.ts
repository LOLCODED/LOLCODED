import { GITHUB_USER, repos } from '../data/repos'
import type { ProjectImage, Repo } from '../data/repos'
import type { RenderContext } from '../render/context'
import { hrefFor } from '../render/context'
import { siteBar, siteFooter } from '../render/chrome'
import { externalLink, projectLink } from '../render/components'
import { html } from '../render/html'
import { documentHtml } from '../render/layout'
import type { Html, Renderable } from '../render/html'

function cell(title: string, children: Renderable): Html {
  return html`<section class="site-cell">
    <h2 class="site-cell-title">${title}</h2>
    ${children}
  </section>`
}

function band(children: Renderable): Html {
  return html`<div class="site-grid">${children}</div>`
}

function projectImage(image: ProjectImage, eager = false): Html {
  const view = image.full ?? image
  return html`<a
    class="pp-shot-link"
    href="${view.src}"
    data-shot
    data-alt="${image.alt}"
    data-w="${view.width}"
    data-h="${view.height}"
  ><img
      src="${image.src}"
      alt="${image.alt}"
      width="${image.width}"
      height="${image.height}"
      loading="${eager ? 'eager' : 'lazy'}"
      decoding="async"
    /></a>`
}

function actions(repo: Repo, className: string): Html {
  return html`<div class="${className}">
    ${externalLink(repo.url, 'pp-action', 'VIEW SOURCE ↗')}
    ${repo.demo ? externalLink(repo.demo, 'pp-action', 'VIEW DEMO ↗') : null}
  </div>`
}

function hero(repo: Repo, position: number): Html {
  return html`<section class="site-hero">
    <p class="site-eyebrow">
      <b>${String(position + 1).padStart(2, '0')}</b> / ${repo.kind.toUpperCase()}
    </p>
    <h1 class="site-title site-title--project">${repo.name}</h1>
    <div class="pp-hero-body${repo.image ? ' pp-hero-body--split' : ''}">
      <div>
        <p class="site-lede">${repo.tagline}</p>
        <p class="pp-intro">${repo.longDescription}</p>
        ${actions(repo, 'pp-actions')}
      </div>
      ${repo.image
        ? html`<div class="pp-hero-shot">${projectImage(repo.image, true)}</div>`
        : null}
    </div>
  </section>`
}

function bodyBands(repo: Repo): Renderable {
  return [
    band(
      cell(
        'what it does',
        html`<ul class="pp-features">
          ${repo.features.map((feature) => html`<li>${feature}</li>`)}
        </ul>`,
      ),
    ),
    repo.screenshots.length > 0
      ? band(
          cell(
            'screenshots',
            html`<div class="pp-shots">
              ${repo.screenshots.map((shot) => projectImage(shot))}
            </div>`,
          ),
        )
      : null,
    band([
      cell(
        'built with',
        html`<ul class="pp-tech">${repo.tech.map((tech) => html`<li>${tech}</li>`)}</ul>`,
      ),
      cell('get it', actions(repo, 'pp-actions pp-actions--cell')),
    ]),
  ]
}

function neighbourNav(context: RenderContext, repo: Repo): Html {
  const index = repos.findIndex((candidate) => candidate.slug === repo.slug)
  const previous = index > 0 ? repos[index - 1] : null
  const next = index < repos.length - 1 ? repos[index + 1] : null

  const neighbour = (target: Repo, label: string, modifier: string) =>
    projectLink(
      context,
      target.slug,
      `site-cell site-cell--link pp-neighbour${modifier}`,
      html`<span class="pp-neighbour-label">${label}</span>
        <span class="pp-neighbour-name">${target.name}</span>`,
    )

  return html`<nav class="site-grid">
    ${previous ? neighbour(previous, '← PREVIOUS', '') : null}
    ${next ? neighbour(next, 'NEXT →', ' pp-neighbour--next') : null}
  </nav>`
}

export function renderProjectPage(context: RenderContext, repo: Repo, year: number): string {
  const position = repos.findIndex((candidate) => candidate.slug === repo.slug)

  const page = html`<div class="site">
      ${siteBar(context, { back: true, middle: `${repo.kind.toUpperCase()} / ${repo.name}` })}
      ${hero(repo, position)}
      ${bodyBands(repo)}
      ${neighbourNav(context, repo)}
      ${siteFooter(year)}
    </div>`

  return documentHtml({
    context,
    title: `${repo.name} — ${GITHUB_USER}`,
    description: repo.tagline,
    path: hrefFor(context, repo.slug),
    body: page,
    imagePreview: Boolean(repo.image) || repo.screenshots.length > 0,
  })
}

export function renderNotFoundPage(context: RenderContext, year: number): string {
  const page = html`<div class="site">
      ${siteBar(context, { back: true, middle: 'ERROR 404' })}

      <section class="site-hero">
        <p class="site-eyebrow"><b>404</b> / NOT FOUND</p>
        <h1 class="site-title site-title--project">no such page</h1>
        <p class="site-lede">Nothing is published here. It may have been flushed.</p>
        <div class="pp-actions">
          ${projectLink(context, null, 'pp-action', '← BACK TO THE INDEX')}
        </div>
      </section>

      <div class="site-grid">
        ${repos.map((repo) =>
          projectLink(
            context,
            repo.slug,
            'site-cell site-cell--link pp-neighbour',
            html`<span class="pp-neighbour-label">${repo.kind.toUpperCase()}</span>
              <span class="pp-neighbour-name">${repo.name}</span>`,
          ),
        )}
      </div>

      ${siteFooter(year)}
    </div>`

  return documentHtml({
    context,
    title: `404 — ${GITHUB_USER}`,
    description: 'Page not found.',
    path: `${context.base}404.html`,
    body: page,
  })
}
