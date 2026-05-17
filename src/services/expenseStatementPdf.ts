import type { ExpenseRecord } from '@/db/dexie'
import appIconUrl from '../../public/icon.png?url'
import {
  appendPageCanvasesToPdf,
  captureStatementPages,
  mountStatementForCapture,
} from '@/services/statementPdfCapture'
import { loadStatementMeta } from '@/utils/statementMeta'

function statementFilename(startDayKey: string, endDayKey: string): string {
  return `kanakku-statement-${startDayKey}-to-${endDayKey}.pdf`
}

/**
 * Tamil expense statement PDF.
 * Layout is rendered in the browser (correct Tamil shaping), then each A4 page is captured to PDF.
 */
export async function downloadExpenseStatementPdf(
  expenses: ExpenseRecord[],
  startDayKey: string,
  endDayKey: string,
  allExpensesForMeta: ExpenseRecord[],
): Promise<void> {
  const meta = await loadStatementMeta(allExpensesForMeta)

  const host = await mountStatementForCapture({
    expenses,
    startDayKey,
    endDayKey,
    logoSrc: appIconUrl,
    meta,
  })

  try {
    const doc = host.iframe.contentDocument
    if (!doc) throw new Error('PDF capture frame lost')

    const pageCanvases = await captureStatementPages(doc)

    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    appendPageCanvasesToPdf(pdf, pageCanvases)
    pdf.save(statementFilename(startDayKey, endDayKey))
  } finally {
    host.destroy()
  }
}
