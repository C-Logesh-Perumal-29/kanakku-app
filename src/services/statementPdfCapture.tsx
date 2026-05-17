import { flushSync } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import type { jsPDF } from 'jspdf'
import {
  ExpenseStatementDocument,
  type ExpenseStatementDocumentProps,
} from '@/components/expense/ExpenseStatementDocument'
import { preloadTamilFonts, injectTamilFontStyles } from '@/utils/statementFonts'

export const STATEMENT_PAGE_WIDTH_PX = 794
export const STATEMENT_PAGE_HEIGHT_PX = 1123
const PDF_MARGIN_MM = 8

export interface CaptureHost {
  iframe: HTMLIFrameElement
  root: Root
  destroy: () => void
}

function createCaptureIframe(): {
  iframe: HTMLIFrameElement
  mount: HTMLElement
  doc: Document
  win: Window
} {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.setAttribute('title', 'statement-pdf-capture')
  iframe.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    `width:${STATEMENT_PAGE_WIDTH_PX}px`,
    'height:100vh',
    'border:0',
    'margin:0',
    'padding:0',
    'opacity:0.01',
    'pointer-events:none',
    'z-index:2147483646',
  ].join(';')

  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  const win = iframe.contentWindow
  if (!doc || !win) {
    iframe.remove()
    throw new Error('PDF capture iframe unavailable')
  }

  doc.open()
  doc.write(
    '<!DOCTYPE html><html lang="ta"><head><meta charset="utf-8"></head><body style="margin:0;background:#fdf5fb"></body></html>',
  )
  doc.close()

  injectTamilFontStyles(doc)

  const mount = doc.createElement('div')
  doc.body.appendChild(mount)

  return { iframe, mount, doc, win }
}

export async function mountStatementForCapture(
  props: ExpenseStatementDocumentProps,
): Promise<CaptureHost> {
  const { iframe, mount, doc, win } = createCaptureIframe()

  await preloadTamilFonts(doc)

  const root = createRoot(mount)
  flushSync(() => {
    root.render(<ExpenseStatementDocument {...props} />)
  })

  await preloadTamilFonts(doc)
  await new Promise<void>((resolve) => {
    win.requestAnimationFrame(() => {
      win.requestAnimationFrame(() => resolve())
    })
  })
  await new Promise<void>((resolve) => window.setTimeout(resolve, 200))

  return {
    iframe,
    root,
    destroy: () => {
      root.unmount()
      iframe.remove()
    },
  }
}

async function capturePageCanvas(pageEl: HTMLElement): Promise<HTMLCanvasElement> {
  const { default: html2canvas } = await import('html2canvas')

  return html2canvas(pageEl, {
    scale: 2,
    backgroundColor: '#fdf5fb',
    useCORS: true,
    allowTaint: false,
    logging: false,
    width: STATEMENT_PAGE_WIDTH_PX,
    height: STATEMENT_PAGE_HEIGHT_PX,
    windowWidth: STATEMENT_PAGE_WIDTH_PX,
    windowHeight: STATEMENT_PAGE_HEIGHT_PX,
    scrollX: 0,
    scrollY: 0,
    foreignObjectRendering: false,
    onclone: (clonedDoc, clonedNode) => {
      injectTamilFontStyles(clonedDoc)
      const node = clonedNode as HTMLElement
      node.setAttribute('lang', 'ta')
      node.style.fontFamily = "'Noto Sans Tamil', 'Hind Madurai', sans-serif"
      node.style.fontFeatureSettings = '"liga" 1, "kern" 1'
    },
  })
}

export async function captureStatementPages(doc: Document): Promise<HTMLCanvasElement[]> {
  const pages = [...doc.querySelectorAll('[data-statement-page]')]
  if (pages.length === 0) {
    throw new Error('Statement pages failed to render')
  }

  const canvases: HTMLCanvasElement[] = []
  for (const page of pages) {
    canvases.push(await capturePageCanvas(page as HTMLElement))
  }
  return canvases
}

/** One canvas = one PDF page, fitted without slicing through content. */
export function appendPageCanvasesToPdf(
  pdf: jsPDF,
  canvases: HTMLCanvasElement[],
  marginMm = PDF_MARGIN_MM,
): void {
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const printableW = pageW - marginMm * 2
  const printableH = pageH - marginMm * 2

  canvases.forEach((canvas, index) => {
    if (index > 0) pdf.addPage()

    const img = canvas.toDataURL('image/jpeg', 0.94)
    const aspect = canvas.width / canvas.height
    let drawW = printableW
    let drawH = drawW / aspect
    if (drawH > printableH) {
      drawH = printableH
      drawW = drawH * aspect
    }
    const x = marginMm + (printableW - drawW) / 2
    const y = marginMm + (printableH - drawH) / 2
    pdf.addImage(img, 'JPEG', x, y, drawW, drawH)
  })
}
