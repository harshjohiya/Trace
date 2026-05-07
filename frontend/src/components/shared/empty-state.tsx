import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
}

export function EmptyState({ title, message, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="card-surface flex flex-col items-center gap-4 p-10 text-center">
      {icon}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <p className="text-sm text-text-secondary">{message}</p>
      </div>
      {actionLabel && onAction ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
