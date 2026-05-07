import type { ReactNode } from "react"
import { motion } from "framer-motion"

interface PageShellProps {
  children: ReactNode
  className?: string
}

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={pageTransition.transition}
      className={className}
    >
      {children}
    </motion.div>
  )
}
