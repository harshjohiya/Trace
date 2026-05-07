import { Navigate, Outlet, useLocation } from "react-router-dom"
import { AppNavbar } from "@/components/layout/app-navbar"
import { getCurrentUser, isAuthenticated } from "@/lib/auth"

export function ProtectedLayout() {
  const location = useLocation()
  if (!isAuthenticated()) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  }

  const user = getCurrentUser()
  if (!user) {
    return <Navigate to="/signin" replace />
  }

  return (
    <div className="min-h-screen bg-bg-surface pb-24">
      <AppNavbar user={user} />
      <main className="page-enter py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
