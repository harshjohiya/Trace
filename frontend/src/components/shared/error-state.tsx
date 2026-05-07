import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <div className="card-surface flex flex-col items-center gap-4 p-8 text-center">
      <span className="rounded-full bg-[var(--danger-light)] p-3 text-[var(--danger)]">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-text-secondary">{message}</p>
      </div>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  )
}
