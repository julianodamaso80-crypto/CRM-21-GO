import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store/auth-store'

// Pages
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { LeadsPage } from './pages/leads/LeadsPage'
import { ContactsPage } from './pages/contacts/ContactsPage'
import { InboxPage } from './pages/inbox/InboxPage'
import { AITrainingPage } from './pages/ai/AITrainingPage'
import { PipeBuilderPage } from './pages/pipes/PipeBuilderPage'
import { PipesListPage } from './pages/pipes/PipesListPage'
import { KanbanPage } from './pages/pipes/KanbanPage'
import { LoginPage } from './pages/auth/LoginPage'
import { WebhooksPage } from './pages/webhooks/WebhooksPage'
import { AutomationsPage } from './pages/automations/AutomationsPage'
import { BillingPage } from './pages/billing/BillingPage'
import { DoctorsPage } from './pages/doctors/DoctorsPage'
import { ConveniosPage } from './pages/convenios/ConveniosPage'
import { AgendaPage } from './pages/agenda/AgendaPage'
import { AnalyticsPage } from './pages/analytics/AnalyticsPage'
import { ProntuarioPage } from './pages/prontuario/ProntuarioPage'
import { NPSPage } from './pages/nps/NPSPage'

// Layouts
import { AppLayout } from './components/layouts/AppLayout'

function PrivateRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/" replace />
  return <Outlet />
}

export function Router() {
  return (
    <Routes>
      {/* Public routes — redirect to / if already logged in */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/deals" element={<Navigate to="/pipes" replace />} />
          <Route path="/patients" element={<ContactsPage />} />
          <Route path="/contacts" element={<Navigate to="/patients" replace />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/convenios" element={<ConveniosPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/prontuario" element={<ProntuarioPage />} />
          <Route path="/nps" element={<NPSPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/ai" element={<AITrainingPage />} />
          <Route path="/pipes" element={<PipesListPage />} />
          <Route path="/pipes/new-ai" element={<PipeBuilderPage />} />
          <Route path="/pipes/:pipeId/kanban" element={<KanbanPage />} />
          <Route path="/webhooks" element={<WebhooksPage />} />
          <Route path="/automations" element={<AutomationsPage />} />
          <Route path="/billing" element={<BillingPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
