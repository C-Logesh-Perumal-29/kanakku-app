import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { AppToaster } from '@/components/ui/app-toaster'
import { ensureDefaultSettings } from '@/db/dexie'
import { useLiveSettings } from '@/hooks/useLiveData'
import { AddExpensePage } from '@/pages/AddExpensePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ExpensesPage } from '@/pages/ExpensesPage'
import { registerServiceWorker } from '@/pwa/registerClient'
import { ta } from '@/translations/ta'
import { normalizeFontSizeLevel } from '@/utils/fontSize'

export default function App() {
  const [isReady, setIsReady] = useState(false)
  const settings = useLiveSettings()

  useEffect(() => {
    let mounted = true

    async function boot(): Promise<void> {
      try {
        await ensureDefaultSettings()
      } finally {
        registerServiceWorker()
        if (mounted) setIsReady(true)
      }
    }

    void boot()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.fontSize = normalizeFontSizeLevel(settings?.fontSizeLevel)
  }, [settings?.fontSizeLevel])

  if (!isReady) {
    return <LoadingScreen fullPage />
  }

  return (
    <BrowserRouter>
      <AppToaster />
      <Routes>
        <Route
          element={
            <AppLayout
              appTitleTamil={ta.appName}
              homeSubtitleTamil={ta.homeSubtitle}
              addExpenseLabelTamil={ta.addExpense}
            />
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="add" element={<AddExpensePage />} />
          <Route path="expenses" element={<ExpensesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
