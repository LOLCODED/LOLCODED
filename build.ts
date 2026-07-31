import { createHash } from 'node:crypto'
import { cp, mkdir, rm, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { repos } from './src/data/repos'
import { renderIndexPage } from './src/pages/index-page'
import { renderNotFoundPage, renderProjectPage } from './src/pages/project-page'
import type { RenderContext } from './src/render/context'

const ROOT = import.meta.dir
const OUT_DIR = join(ROOT, 'dist')
const STYLESHEET = join(ROOT, 'src/styles/main.css')
const IMAGE_PREVIEW = join(ROOT, 'src/image-preview/image-preview.ts')

const STATIC_DIR = join(ROOT, 'static')

const BASE = normaliseBase(process.env.SITE_BASE ?? '/')

const ASSETS = [
  {
    name: 'favicon',
    file: 'favicon',
    source: join(ROOT, 'src/assets/favicon.png'),
    extension: 'png',
  },
] as const

type AssetName = (typeof ASSETS)[number]['name']

function normaliseBase(value: string): string {
  const withLeading = value.startsWith('/') ? value : `/${value}`
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`
}

function contentHash(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex').slice(0, 8)
}

async function buildStylesheet(): Promise<string> {
  const result = await Bun.build({ entrypoints: [STYLESHEET], minify: true })
  if (!result.success) {
    throw new AggregateError(result.logs, 'Stylesheet build failed')
  }
  const output = result.outputs[0]
  if (!output) throw new Error('Stylesheet build produced no output')
  const css = await output.text()

  if (/<\/style/i.test(css)) {
    throw new Error('Stylesheet contains "</style", which cannot be inlined safely')
  }
  return css.trim()
}

async function buildImagePreview(): Promise<string> {
  const result = await Bun.build({
    entrypoints: [IMAGE_PREVIEW],
    minify: true,
    target: 'browser',
  })
  if (!result.success) {
    throw new AggregateError(result.logs, 'Image preview build failed')
  }
  const output = result.outputs[0]
  if (!output) throw new Error('Image preview build produced no output')
  const code = (await output.text()).trim()
  if (/<\/script/i.test(code)) {
    throw new Error('Image preview contains "</script", which cannot be inlined safely')
  }
  return code
}

async function emitAssets(): Promise<Record<AssetName, string>> {
  const urls = {} as Record<AssetName, string>
  for (const asset of ASSETS) {
    const bytes = new Uint8Array(await Bun.file(asset.source).arrayBuffer())
    const fileName = `${asset.file}-${contentHash(bytes)}.${asset.extension}`
    await Bun.write(join(OUT_DIR, 'assets', fileName), bytes)
    urls[asset.name] = `${BASE}assets/${fileName}`
  }
  return urls
}

async function copyStaticFiles(): Promise<void> {
  const directory = await stat(STATIC_DIR).catch(() => null)
  if (!directory?.isDirectory()) return
  await cp(STATIC_DIR, OUT_DIR, { recursive: true })
}

async function writePage(path: string, contents: string): Promise<number> {
  await Bun.write(join(OUT_DIR, path), contents)
  return Buffer.byteLength(contents)
}

export async function build(): Promise<void> {
  const started = performance.now()
  await rm(OUT_DIR, { recursive: true, force: true })
  await mkdir(OUT_DIR, { recursive: true })

  const [css, imagePreviewJs, assetUrls] = await Promise.all([
    buildStylesheet(),
    buildImagePreview(),
    emitAssets(),
    copyStaticFiles(),
  ])

  const context: RenderContext = {
    base: BASE,
    css,
    imagePreviewJs,
    faviconUrl: assetUrls.favicon,
  }

  const year = new Date().getFullYear()
  const pages: Array<[string, string]> = [
    ['index.html', renderIndexPage(context, year)],
    ['404.html', renderNotFoundPage(context, year)],
    ...repos.map(
      (repo) =>
        [`${repo.slug}/index.html`, renderProjectPage(context, repo, year)] as [string, string],
    ),
  ]

  let total = 0
  for (const [path, contents] of pages) {
    total += await writePage(path, contents)
  }

  const elapsed = (performance.now() - started).toFixed(0)
  console.log(
    `built ${pages.length} pages (${(total / 1024).toFixed(1)} kB html, ` +
      `${(css.length / 1024).toFixed(1)} kB css inlined) in ${elapsed}ms`,
  )
}

if (import.meta.main) {
  await build()
}
