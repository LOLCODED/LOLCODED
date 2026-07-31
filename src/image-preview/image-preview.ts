const ZOOM_STEP = 1.15
const MIN_ZOOM = 0.1
const MAX_ZOOM = 10

const OPEN_W = 0.92
const OPEN_H = 0.88

const PIP_W = 0.32
const PIP_MIN = 240
const PIP_MAX = 520
const PIP_MARGIN = 24

const GRIP_INSET = 8

type Mode = 'center' | 'pip'

interface Shot {
  src: string
  alt: string
  width: number
  height: number
}

const clamp = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, value))

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  node.className = className
  return node
}

function start(triggers: HTMLAnchorElement[]): void {
  const shots: Shot[] = triggers.map((link) => ({
    src: link.href,
    alt: link.dataset.alt ?? '',
    width: Number(link.dataset.w) || 0,
    height: Number(link.dataset.h) || 0,
  }))

  const backdrop = element('div', 'preview-backdrop')
  const frame = element('div', 'preview-frame')
  const bar = element('div', 'preview-bar')
  const closeButton = element('button', 'preview-close')
  const image = element('img', 'preview-img')
  const counter = element('div', 'preview-counter')
  const handle = element('div', 'preview-resize')

  closeButton.type = 'button'
  closeButton.textContent = '✕'
  closeButton.setAttribute('aria-label', 'Close')
  backdrop.setAttribute('role', 'dialog')
  backdrop.setAttribute('aria-modal', 'true')
  image.draggable = false

  frame.append(bar, image, counter, handle)
  backdrop.append(frame)

  let index = 0
  let mode: Mode = 'center'
  let zoom = 1

  let panX = 0
  let panY = 0
  let pipW = 0
  let pipH = 0
  let pipX = 0
  let pipY = 0

  let returnFocus: HTMLElement | null = null

  const shot = () => shots[index]

  function baseScale(): number {
    const current = shot()
    if (!current) return 1
    return Math.min(
      (window.innerWidth * OPEN_W) / current.width,
      (window.innerHeight * OPEN_H) / current.height,
      1,
    )
  }

  function layoutCenter(): void {
    const current = shot()
    if (!current) return
    const width = current.width * baseScale() * zoom
    const height = current.height * baseScale() * zoom

    const slackX = Math.max(0, (width - window.innerWidth) / 2)
    const slackY = Math.max(0, (height - window.innerHeight) / 2)
    panX = clamp(panX, -slackX, slackX)
    panY = clamp(panY, -slackY, slackY)

    const left = (window.innerWidth - width) / 2 + panX
    const top = (window.innerHeight - height) / 2 + panY

    frame.style.width = `${Math.round(width)}px`
    frame.style.height = `${Math.round(height)}px`
    frame.style.left = `${Math.round(left)}px`
    frame.style.top = `${Math.round(top)}px`

    image.style.width = `${Math.round(width)}px`
    image.style.height = `${Math.round(height)}px`
    image.style.transform = 'translate(-50%, -50%)'
    image.classList.toggle('preview-img--pannable', slackX > 0.5 || slackY > 0.5)

    const overhangX = left + width - window.innerWidth
    const overhangY = top + height - window.innerHeight
    handle.style.right = `${Math.round(overhangX > 0 ? overhangX + GRIP_INSET : 0)}px`
    handle.style.bottom = `${Math.round(overhangY > 0 ? overhangY + GRIP_INSET : 0)}px`
  }

  function layoutPip(): void {
    const current = shot()
    if (!current) return
    const fit = Math.min(pipW / current.width, pipH / current.height)
    const width = current.width * fit * zoom
    const height = current.height * fit * zoom
    const slackX = Math.max(0, (width - pipW) / 2)
    const slackY = Math.max(0, (height - pipH) / 2)
    panX = clamp(panX, -slackX, slackX)
    panY = clamp(panY, -slackY, slackY)

    pipX = clamp(pipX, -pipW + 60, window.innerWidth - 60)
    pipY = clamp(pipY, 0, window.innerHeight - 40)

    frame.style.width = `${Math.round(pipW)}px`
    frame.style.height = `${Math.round(pipH)}px`
    frame.style.left = `${Math.round(pipX)}px`
    frame.style.top = `${Math.round(pipY)}px`
    handle.style.right = '0px'
    handle.style.bottom = '0px'
    image.style.width = `${Math.round(width)}px`
    image.style.height = `${Math.round(height)}px`
    image.style.transform = `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px))`
    image.classList.toggle('preview-img--pannable', slackX > 0.5 || slackY > 0.5)
  }

  const layout = () => (mode === 'center' ? layoutCenter() : layoutPip())

  function applyMode(): void {
    const pip = mode === 'pip'
    backdrop.classList.toggle('preview-backdrop--pip', pip)
    frame.classList.toggle('preview-frame--pip', pip)
    document.body.classList.toggle('preview-locked', !pip)
    if (pip) bar.append(closeButton)
    else backdrop.append(closeButton)
  }

  function toCenter(): void {
    mode = 'center'
    zoom = 1
    panX = 0
    panY = 0
    applyMode()
    layout()
  }

  function toPip(): void {
    const current = shot()
    if (!current) return
    mode = 'pip'
    zoom = 1
    panX = 0
    panY = 0
    pipW = clamp(window.innerWidth * PIP_W, PIP_MIN, PIP_MAX)
    pipH = pipW * (current.height / current.width)
    pipX = window.innerWidth - pipW - PIP_MARGIN
    pipY = window.innerHeight - pipH - PIP_MARGIN
    applyMode()
    layout()
  }

  function show(next: number): void {
    index = (next + shots.length) % shots.length
    const current = shot()
    if (!current) return
    image.src = current.src
    image.alt = current.alt
    counter.textContent = `${index + 1} / ${shots.length}`
    counter.style.display = shots.length > 1 ? 'block' : 'none'
    if (mode === 'pip') toPip()
    else toCenter()
  }

  function open(at: number, trigger: HTMLElement): void {
    returnFocus = trigger
    mode = 'center'
    document.body.append(backdrop)
    show(at)
    closeButton.focus()
  }

  function close(): void {
    backdrop.remove()
    document.body.classList.remove('preview-locked')
    returnFocus?.focus()
    returnFocus = null
  }

  const isOpen = () => backdrop.isConnected

  function zoomBy(factor: number): void {
    const previous = zoom
    zoom = clamp(zoom * factor, MIN_ZOOM, MAX_ZOOM)
    const ratio = zoom / previous
    panX *= ratio
    panY *= ratio
    layout()
  }

  function draggable(target: HTMLElement, onMove: (dx: number, dy: number) => void): void {
    target.addEventListener('pointerdown', (event: PointerEvent) => {
      if (event.button !== 0) return
      event.preventDefault()
      let lastX = event.clientX
      let lastY = event.clientY
      try {
        target.setPointerCapture(event.pointerId)
      } catch {
      }

      const move = (moveEvent: PointerEvent) => {
        onMove(moveEvent.clientX - lastX, moveEvent.clientY - lastY)
        lastX = moveEvent.clientX
        lastY = moveEvent.clientY
        layout()
      }
      const up = () => {
        target.removeEventListener('pointermove', move)
        target.removeEventListener('pointerup', up)
        target.removeEventListener('pointercancel', up)
      }
      target.addEventListener('pointermove', move)
      target.addEventListener('pointerup', up)
      target.addEventListener('pointercancel', up)
    })
  }

  draggable(bar, (dx, dy) => {
    if (mode !== 'pip') return
    pipX += dx
    pipY += dy
  })

  draggable(handle, (dx, dy) => {
    const current = shot()
    if (!current) return
    if (mode === 'pip') {
      const aspect = pipH / pipW || 1
      pipW = clamp(pipW + (dx + dy / aspect) / 2, PIP_MIN, window.innerWidth - PIP_MARGIN)
      pipH = pipW * aspect
      return
    }
    const base = baseScale()
    const aspect = current.height / current.width
    const width = current.width * base * zoom + dx + dy / aspect
    zoom = clamp(width / (current.width * base), MIN_ZOOM, MAX_ZOOM)
  })

  draggable(image, (dx, dy) => {
    panX += dx
    panY += dy
  })

  triggers.forEach((link, at) => {
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }
      event.preventDefault()
      open(at, link)
    })
  })

  closeButton.addEventListener('click', close)
  backdrop.addEventListener('pointerdown', (event) => {
    if (event.target === backdrop) close()
  })

  backdrop.addEventListener(
    'wheel',
    (event: WheelEvent) => {
      event.preventDefault()
      zoomBy(event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP)
    },
    { passive: false },
  )

  window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (!isOpen()) return
    const key = event.key
    if (key === 'Escape') close()
    else if (key === 'ArrowRight') show(index + 1)
    else if (key === 'ArrowLeft') show(index - 1)
    else if (key === '+' || key === '=') zoomBy(ZOOM_STEP)
    else if (key === '-') zoomBy(1 / ZOOM_STEP)
    else if (key === '0') show(index)
    else if (key === ' ') toCenter()
    else if (key === 'p' || key === 'P') {
      if (mode === 'pip') toCenter()
      else toPip()
    } else return
    event.preventDefault()
  })

  window.addEventListener('resize', () => {
    if (isOpen()) show(index)
  })
}

const triggers = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[data-shot]'))
if (triggers.length > 0) start(triggers)
