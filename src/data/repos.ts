export interface ImageFile {
  src: string

  width: number
  height: number
}

export interface ProjectImage extends ImageFile {
  alt: string

  full?: ImageFile
}

export interface Repo {
  name: string
  slug: string
  tagline: string

  description: string

  longDescription: string
  tech: string[]
  url: string
  demo?: string

  kind: string
  features: string[]

  image?: ProjectImage

  screenshots: ProjectImage[]
}

export const GITHUB_USER = 'LOLCODED'
export const GITHUB_URL = `https://github.com/${GITHUB_USER}`

export const repos: Repo[] = [
  {
    name: 'demoscope',
    slug: 'demoscope',
    tagline: 'Record walkthroughs. Ship videos and docs.',
    description:
      'A Chrome extension that records product walkthroughs — clicks, typing, scrolling, and navigation, each captured with a screenshot — then turns them into polished MP4/GIF videos or step-by-step documents, edited entirely in the browser. No Playwright, no CLI, no server.',
    longDescription:
      'Demoscope records what you actually see in the browser — every click, keystroke, scroll, and navigation, each captured with a screenshot — then turns that recording into either a polished MP4/GIF video or a step-by-step document. Everything is edited in the browser, so there is no Playwright, no CLI, and no server. Because it records your real session, pages behind a login just work.',
    tech: ['TypeScript', 'Svelte', 'WebCodecs', 'MV3'],
    url: `${GITHUB_URL}/demoscope`,
    kind: 'extension',
    image: {
      src: '/demoscope/hero.webp',
      alt: 'The demoscope editor: a captured step on the canvas with a "Click Amazon" annotation over it, and the recording laid out as segments on the timeline below.',
      width: 1280,
      height: 720,
      full: { src: '/demoscope/hero-full.webp', width: 1920, height: 1080 },
    },
    screenshots: [
      {
        src: '/demoscope/1.webp',
        alt: 'A recorded walkthrough open in the editor, each captured step a segment on the timeline.',
        width: 640,
        height: 360,
        full: { src: '/demoscope/1-full.webp', width: 1920, height: 1080 },
      },
      {
        src: '/demoscope/2.webp',
        alt: 'Recording in progress, with the capture panel docked over the page being recorded.',
        width: 640,
        height: 360,
        full: { src: '/demoscope/2-full.webp', width: 1920, height: 1080 },
      },
      {
        src: '/demoscope/3.webp',
        alt: 'The same recording generated as a step-by-step document, every step with its own screenshot.',
        width: 640,
        height: 360,
        full: { src: '/demoscope/3-full.webp', width: 1920, height: 1080 },
      },
    ],
    features: [
      'One-click recording — captures clicks, typing, scrolling, key presses, and navigation, with a screenshot at every step.',
      'Works behind auth — records your real session, so gated and internal pages need no special setup.',
      'In-browser editor — a timeline with trimming, cuts, auto-zoom segments, smooth cursor motion, animated click effects, subtitles, and annotations.',
      'Two outputs from one recording — render a narrated MP4/GIF, or generate a step document you can copy as Markdown, download with images, or print to PDF.',
      'Recording library — recordings are stored locally; reopen, rename, or delete them any time.',
    ],
  },
  {
    name: 'hoverglass',
    slug: 'hoverglass',
    tagline: 'Hover a thumbnail, see the real thing.',
    description:
      'A lightweight browser extension that expands an image or video next to your cursor when you hover a thumbnail — and plays YouTube/Twitch inline. Zoom, pan, pin to center, or detach into a draggable PiP window. Chromium and Firefox from one MV3 codebase.',
    longDescription:
      'Hoverglass expands an image or video next to your cursor when you hover its thumbnail, and follows the cursor as you move, repositioning to stay on screen. It plays YouTube and Twitch inline, handles Reddit videos and galleries, and can pin a preview to the center or detach it into a draggable picture-in-picture window. One Manifest V3 codebase covers Chromium and Firefox.',
    tech: ['TypeScript', 'esbuild', 'MV3', 'Vitest'],
    url: `${GITHUB_URL}/hoverglass`,
    kind: 'extension',
    features: [
      'Hover to expand — full-size media appears beside the cursor and follows it, repositioning to stay on screen.',
      'Hover to play video — YouTube and Twitch links open an autoplaying muted player; direct .mp4/.webm/.gif media plays too.',
      'Reddit videos and galleries — v.redd.it posts play inline, and gallery posts step through with the arrow keys.',
      'Center to inspect — the pin key (default Space) sticky-centers the preview for a focused look.',
      'PiP / free-flow — the PiP key (default P) detaches the preview into a floating window you can drag while the page scrolls underneath.',
      'Zoom, pan and resize — +/- zoom in both center and PiP, wheel zoom in center mode, cursor panning once zoomed past the viewport, and drag-corner resizing.',
      'Smart resolution — srcset, wrapping links, lazy-load data attributes and CSS background images, plus an editable rule set for YouTube, Twitch, Twitter/X, Imgur, and Wikimedia.',
    ],
    image: {
      src: '/hoverglass/hero.webp',
      alt: 'A Reddit feed with a hovered thumbnail expanded into a large, fully readable preview beside the cursor.',
      width: 1280,
      height: 720,
      full: { src: '/hoverglass/hero-full.webp', width: 1920, height: 1080 },
    },
    screenshots: [
      {
        src: '/hoverglass/1.webp',
        alt: 'The preview at a mid size beside the cursor, with the feed still readable behind it.',
        width: 640,
        height: 360,
        full: { src: '/hoverglass/1-full.webp', width: 1920, height: 1080 },
      },
      {
        src: '/hoverglass/2.webp',
        alt: 'The preview zoomed large, filling most of the window for a close look.',
        width: 640,
        height: 360,
        full: { src: '/hoverglass/2-full.webp', width: 1920, height: 1080 },
      },
      {
        src: '/hoverglass/3.webp',
        alt: 'The preview detached into a small picture-in-picture window in the corner, with the page live behind it.',
        width: 640,
        height: 360,
        full: { src: '/hoverglass/3-full.webp', width: 1920, height: 1080 },
      },
    ],
  },
  {
    name: 'music-player',
    slug: 'music-player',
    tagline: 'Your Subsonic library, everywhere.',
    description:
      'A Subsonic-compatible music player that works with any server speaking the Subsonic API — Navidrome, Airsonic, Funkwhale. Runs on the web, iOS, and Android from a single codebase, and self-hosts as a Docker container.',
    longDescription:
      'A music player for any server that speaks the Subsonic API — Navidrome, Airsonic, Funkwhale, and the rest. Point it at your server, enter your credentials once, and it runs on the web, iOS, and Android from a single codebase via Capacitor. The web build ships as a Docker container, so self-hosting it is the same exercise as self-hosting the server behind it.',
    tech: ['React', 'TypeScript', 'Capacitor', 'Tailwind'],
    url: `${GITHUB_URL}/music-player`,
    kind: 'app',
    features: [
      'Works with any Subsonic-compatible server — Navidrome, Airsonic, Funkwhale, and others.',
      'Web, iOS, and Android from a single codebase, built and deployed through Capacitor.',
      'Self-hosts as a Docker container, with a docker-compose file included.',
      'Server URL and credentials are entered on first launch — no account, no third-party service in between.',
    ],
    screenshots: [],
  },
]

export function findRepoBySlug(slug: string): Repo | undefined {
  return repos.find((repo) => repo.slug === slug)
}
