import type { ReactNode } from "react"
import { CheckCircle2, Sparkles } from "lucide-react"
import { AudioLines } from "lucide-react"
import { motion } from "framer-motion"

interface AuthSplitLayoutProps {
  quote: string
  children: ReactNode
}

const bullets = [
  "Auto transcription with speaker IDs",
  "Action items extracted instantly",
  "Ask anything across all meetings",
]

export function AuthSplitLayout({ quote, children }: AuthSplitLayoutProps) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-bg-page p-10 md:flex md:flex-col md:justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-purple-500/10 to-transparent opacity-80" />
        <div className="absolute -left-20 top-20 h-96 w-96 rounded-full bg-primary/20 mix-blend-multiply blur-[100px] animate-blob" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-pink-500/20 mix-blend-multiply blur-[100px] animate-blob animation-delay-2000" />
        
        <div className="relative z-10 mx-auto max-w-md space-y-8 rounded-3xl border border-white/40 bg-white/40 p-8 shadow-glass backdrop-blur-xl">
          <div className="flex items-center gap-3 text-2xl font-bold text-text-primary">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
              <AudioLines className="h-6 w-6" />
            </div>
            Trace
          </div>
          <p className="text-3xl font-extrabold leading-tight tracking-tight text-text-primary">
            <Sparkles className="mb-2 h-6 w-6 text-primary" />
            {quote}
          </p>
          <ul className="space-y-4 text-text-secondary">
            {bullets.map((bullet, i) => (
              <motion.li 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                key={bullet} 
                className="flex items-center gap-3 font-medium"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                {bullet}
              </motion.li>
            ))}
          </ul>
        </div>
      </aside>
      <div className="flex items-center justify-center bg-white p-6 sm:p-10 relative">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-bg-surface to-transparent opacity-50" />
        <div className="relative z-10 w-full flex justify-center">
          {children}
        </div>
      </div>
    </div>
  )
}
