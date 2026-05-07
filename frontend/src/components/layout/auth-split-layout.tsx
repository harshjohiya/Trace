import type { ReactNode } from "react"
import { CheckCircle2 } from "lucide-react"
import { AudioLines } from "lucide-react"

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
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary to-[#8b5cf6] p-10 text-white md:flex md:flex-col md:justify-center">
        <div className="absolute left-[-40px] top-20 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute bottom-10 right-[-80px] h-64 w-64 rounded-full bg-white/10" />
        <div className="relative z-10 mx-auto max-w-md space-y-7">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <AudioLines className="h-6 w-6" />
            Trace
          </div>
          <p className="text-4xl font-bold leading-tight tracking-tight">{quote}</p>
          <ul className="space-y-3 text-white/90">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <div className="flex items-center justify-center bg-white p-6 sm:p-10">{children}</div>
    </div>
  )
}
