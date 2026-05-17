/** Matches favicon / PWA icon path (see `public/icon.png`). */
export const STATEMENT_APP_ICON_SRC = '/icon.png'

/** Branded fallback when `icon.png` is unavailable during PDF render. */
export const STATEMENT_LOGO_FALLBACK =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#e9a8cf"/><stop offset="55%" stop-color="#dc84b9"/><stop offset="100%" stop-color="#c55d9f"/></linearGradient></defs><rect width="96" height="96" rx="24" fill="url(#g)"/><text x="48" y="58" text-anchor="middle" font-family="Noto Sans Tamil,sans-serif" font-size="42" font-weight="700" fill="#fffefa">க</text></svg>`,
  )
