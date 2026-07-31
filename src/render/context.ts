export interface RenderContext {
  base: string

  css: string

  imagePreviewJs: string
  faviconUrl: string
}

export function hrefFor(context: RenderContext, slug: string | null): string {
  return slug ? `${context.base}${encodeURIComponent(slug)}/` : context.base
}
