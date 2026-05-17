/**
 * Tamil PDFs must use the browser text shaper (Noto Sans Tamil via @fontsource).
 * jsPDF TTF embedding does not apply OpenType ligatures — vowels render as dotted circles.
 */
import notoTamil400Css from '@fontsource/noto-sans-tamil/400.css?url'
import notoTamil700Css from '@fontsource/noto-sans-tamil/700.css?url'

export const STATEMENT_FONT_FAMILY = "'Noto Sans Tamil', 'Hind Madurai', sans-serif"

const TAMIL_FONT_LINKS = [notoTamil400Css, notoTamil700Css] as const

let mainDocumentFontsInjected = false

export function injectTamilFontStyles(target: Document): void {
  for (const href of TAMIL_FONT_LINKS) {
    if (target.querySelector(`link[data-statement-font="${href}"]`)) continue
    const link = target.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.dataset.statementFont = href
    target.head.appendChild(link)
  }
}

export function ensureTamilFontsOnDocument(doc: Document = document): void {
  injectTamilFontStyles(doc)
  if (doc === document) mainDocumentFontsInjected = true
}

export async function preloadTamilFonts(doc: Document = document): Promise<void> {
  ensureTamilFontsOnDocument(doc)
  await Promise.all([
    doc.fonts.load(`400 14px ${STATEMENT_FONT_FAMILY}`),
    doc.fonts.load(`600 14px ${STATEMENT_FONT_FAMILY}`),
    doc.fonts.load(`700 14px ${STATEMENT_FONT_FAMILY}`),
  ])
  await doc.fonts.ready
}

/** Call once at app startup so the first PDF export is faster. */
export function warmStatementFonts(): void {
  if (mainDocumentFontsInjected) return
  void preloadTamilFonts()
}
