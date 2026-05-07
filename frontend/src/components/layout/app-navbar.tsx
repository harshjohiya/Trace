import { motion } from "framer-motion"
import { AudioLines, ChevronDown } from "lucide-react"
import { useMemo, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { SpeakerAvatar } from "@/components/shared/speaker-avatar"
import { signOut } from "@/lib/auth"
import type { AuthUser } from "@/types"
import { cn } from "@/lib/utils"

const links = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Meetings", to: "/meetings" },
  { label: "Ask Trace", to: "/ask" },
]

export function AppNavbar({ user }: { user: AuthUser }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const currentPath = useMemo(() => pathname.split("/")[1], [pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-border-light bg-white/90 backdrop-blur-xl">
      <div className="page-enter flex h-16 items-center justify-between gap-4">
        <Link to="/dashboard" className="flex items-center gap-2 text-lg font-bold text-text-primary">
          <AudioLines className="h-5 w-5 text-primary" />
          Trace
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => {
            const key = link.to.split("/")[1]
            const active = key === currentPath
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "relative pb-1 text-sm transition-colors",
                  active ? "font-semibold text-primary" : "text-text-secondary hover:text-primary",
                )}
              >
                {link.label}
                {active ? <span className="absolute -bottom-2 left-1/2 h-[6px] w-[6px] -translate-x-1/2 rounded-full bg-primary" /> : null}
              </Link>
            )
          })}
        </nav>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex items-center gap-2 rounded-full border border-border-light bg-white p-1 pr-3 shadow-xs"
          >
            <SpeakerAvatar name={user.name} size="sm" />
            <span className="hidden text-sm font-medium text-text-secondary sm:block">{user.name}</span>
            <ChevronDown className="h-4 w-4 text-text-muted" />
          </button>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-64 rounded-lg border border-border-light bg-white p-3 shadow-lg"
            >
              <div>
                <p className="text-sm font-semibold text-text-primary">{user.name}</p>
                <p className="text-sm text-text-muted">{user.email}</p>
              </div>
              <div className="my-3 h-px bg-border-light" />
              <button
                type="button"
                className="w-full rounded-md px-3 py-2 text-left text-sm text-[var(--danger)] hover:bg-[var(--danger-light)]"
                onClick={() => {
                  signOut()
                  setOpen(false)
                  navigate("/signin", { replace: true })
                }}
              >
                Sign out
              </button>
            </motion.div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
