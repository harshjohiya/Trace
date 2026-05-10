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

  const isAskPage = location.pathname === "/ask"

  return (
    <div className={`bg-bg-surface ${isAskPage ? "h-screen flex flex-col overflow-hidden" : "min-h-screen pb-24"}`}>
      <div className="flex-shrink-0 z-50">
        <AppNavbar user={user} />
      </div>
      <main className={`page-enter flex-1 relative ${isAskPage ? "overflow-hidden p-4 sm:px-8 sm:pb-8 pt-4" : "py-6 sm:py-8"}`}>
        <Outlet />
      </main>
    </div>
  )
}
