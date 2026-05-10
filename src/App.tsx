import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AppToaster } from '@/components/ui/app-toaster'
import { ensureDefaultSettings } from '@/db/dexie'
import { AddExpensePage } from '@/pages/AddExpensePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ExpensesPage } from '@/pages/ExpensesPage'
import { registerServiceWorker } from '@/pwa/registerClient'
import { ta } from '@/translations/ta'

export default function App() {
  useEffect(() => {
    void ensureDefaultSettings()
    registerServiceWorker()
  }, [])

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
