import { AudioLines } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border-light bg-white py-10">
      <div className="page-enter grid gap-6 md:grid-cols-2 md:items-center">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <AudioLines className="h-4 w-4 text-primary" />
          <span className="font-semibold text-text-primary">Trace</span>
          <span>Meeting Intelligence</span>
        </div>
        <p className="text-sm text-text-secondary md:text-right">
          Built with local AI · Your data never leaves
        </p>
      </div>
      <p className="mt-6 text-center text-sm text-text-muted">© 2026 Trace</p>
    </footer>
  )
}
