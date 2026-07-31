import { existsSync, watch } from 'node:fs'
import { join } from 'node:path'
import { build } from './build'

const PORT = Number(process.env.PORT ?? 5173)
const ROOT = import.meta.dir
const OUT_DIR = join(ROOT, 'dist')

const WATCHED = ['src', 'build.ts', 'static']
const REBUILD_DEBOUNCE_MS = 40

async function resolveFile(pathname: string): Promise<Bun.BunFile | null> {
  const clean = decodeURIComponent(pathname).replace(/\/+$/, '')
  const candidates = clean.includes('.')
    ? [clean]
    : [`${clean}/index.html`, `${clean || '/'}/index.html`.replace('//', '/')]

  for (const candidate of candidates) {
    const file = Bun.file(join(OUT_DIR, candidate))
    if (await file.exists()) return file
  }
  return null
}

let rebuilding: Promise<void> = build()

function scheduleRebuild(): void {
  let timer: ReturnType<typeof setTimeout> | null = null
  const run = () => {
    rebuilding = build().catch((error: unknown) => {
      console.error('build failed:', error)
    })
  }
  for (const path of WATCHED.filter((entry) => existsSync(join(ROOT, entry)))) {
    watch(join(ROOT, path), { recursive: true }, () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(run, REBUILD_DEBOUNCE_MS)
    })
  }
}

await rebuilding
scheduleRebuild()

Bun.serve({
  port: PORT,
  async fetch(request) {
    await rebuilding
    const { pathname } = new URL(request.url)
    const file = await resolveFile(pathname)
    if (file) return new Response(file, { headers: { 'cache-control': 'no-store' } })

    const notFound = Bun.file(join(OUT_DIR, '404.html'))
    return new Response(await notFound.exists() ? notFound : 'Not found', { status: 404 })
  },
})

console.log(`dev server on http://localhost:${PORT}`)
