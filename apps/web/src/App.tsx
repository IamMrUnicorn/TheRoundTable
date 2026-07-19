import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider } from './features/auth/AuthProvider'
import { useAuth } from './features/auth/auth-context'
import { DashboardPage } from './pages/DashboardPage'
import { CampaignPage } from './pages/CampaignPage'
import { CharacterPage } from './pages/CharacterPage'
import { ProfilePage } from './pages/ProfilePage'
import { SchedulePage } from './pages/SchedulePage'
import { SignInPage } from './pages/SignInPage'
import { CharactersPage } from './pages/CharactersPage'
import { CalendarHubPage } from './pages/CalendarHubPage'
import { SessionPage } from './pages/SessionPage'
import { AppNav } from './components/AppNav'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { identity, isLoading } = useAuth()

  if (isLoading) {
    return (
      <main className="loading-screen" aria-live="polite">
        <div className="loading-mark">RT</div>
        <p>Preparing your seat at the table…</p>
      </main>
    )
  }

  return identity ? children : <Navigate to="/sign-in" replace />
}

function AppRoutes() {
  const { identity, isLoading } = useAuth()

  return (
    <>
      <AppNav />
      <Routes>
        <Route
          path="/sign-in"
          element={
            !isLoading && identity ? (
              <Navigate to="/" replace />
            ) : (
              <SignInPage />
            )
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parties"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/characters"
          element={
            <ProtectedRoute>
              <CharactersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarHubPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaigns/:campaignId"
          element={
            <ProtectedRoute>
              <CampaignPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/characters/:characterId"
          element={
            <ProtectedRoute>
              <CharacterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaigns/:campaignId/schedule"
          element={
            <ProtectedRoute>
              <SchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaigns/:campaignId/sessions/:sessionId"
          element={
            <ProtectedRoute>
              <SessionPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
