import { useCallback, useEffect, useRef, useState } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { AppHealthOverlay } from "@/components/shared/app-health-overlay"
import { healthCheck } from "@/api"
import { AskPage } from "@/pages/AskPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { LandingPage } from "@/pages/LandingPage"
import { MeetingDetailPage } from "@/pages/MeetingDetailPage"
import { MeetingsPage } from "@/pages/MeetingsPage"
import { SignInPage } from "@/pages/SignInPage"
import { SignUpPage } from "@/pages/SignUpPage"
import { ProtectedLayout } from "./components/layout/protected-layout"

function App() {
  const [appOffline, setAppOffline] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const intervalRef = useRef<number | null>(null)

  const pingHealth = useCallback(async () => {
    setIsChecking(true)
    try {
      await healthCheck()
      setAppOffline(false)
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    } catch {
      setAppOffline(true)
    } finally {
      setIsChecking(false)
    }
  }, [])

  useEffect(() => {
    void pingHealth()
  }, [pingHealth])

  useEffect(() => {
    if (!appOffline || intervalRef.current) return
    intervalRef.current = window.setInterval(() => {
      void pingHealth()
    }, 5000)
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [appOffline, pingHealth])

  return (
    <>
      <AppHealthOverlay isVisible={appOffline} isChecking={isChecking} onRetry={() => void pingHealth()} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/meetings/:id" element={<MeetingDetailPage />} />
          <Route path="/ask" element={<AskPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
