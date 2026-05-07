import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AudioLines } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-200",
        scrolled ? "border-b border-border-light bg-white/90 backdrop-blur-xl" : "bg-white",
      )}
    >
      <div className="page-enter flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-text-primary">
          <AudioLines className="h-5 w-5 text-primary" />
          Trace
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/signin" className="text-sm font-medium text-text-secondary hover:text-primary">
            Sign in
          </Link>
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link to="/signup">
              <Button size="sm">Get started free</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  )
}
