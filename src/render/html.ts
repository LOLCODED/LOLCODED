const RAW = Symbol('raw-html')

export interface Html {
  readonly [RAW]: string
}

export type Renderable = Html | string | number | null | undefined | false | Renderable[]

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ESCAPES[character] ?? character)
}

function isHtml(value: unknown): value is Html {
  return typeof value === 'object' && value !== null && RAW in value
}

function renderValue(value: Renderable): string {
  if (value === null || value === undefined || value === false) return ''
  if (Array.isArray(value)) return value.map(renderValue).join('')
  if (isHtml(value)) return value[RAW]
  return escapeHtml(String(value))
}

export function html(strings: TemplateStringsArray, ...values: Renderable[]): Html {
  let out = strings[0] ?? ''
  for (let index = 0; index < values.length; index += 1) {
    out += renderValue(values[index]) + (strings[index + 1] ?? '')
  }
  return { [RAW]: out }
}

export function raw(value: string): Html {
  return { [RAW]: value }
}

export function renderToString(value: Renderable): string {
  return renderValue(value)
}
