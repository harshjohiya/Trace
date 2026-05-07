import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface AppHealthOverlayProps {
  isVisible: boolean
  isChecking: boolean
  onRetry: () => void
}

export function AppHealthOverlay({ isVisible, isChecking, onRetry }: AppHealthOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(255,255,255,0.85)] p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-xl rounded-2xl border border-border-light bg-white p-8 shadow-xl"
      >
        <h2 className="text-2xl font-bold text-text-primary">Cannot connect to Trace backend</h2>
        <p className="mt-3 text-text-secondary">
          Start the API server and retry. Trace will reconnect automatically once health checks pass.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-md bg-bg-surface p-4 font-mono text-sm text-text-primary">
          uvicorn backend.main:app --reload
        </pre>
        <Button className="mt-6" onClick={onRetry} isLoading={isChecking}>
          {isChecking ? "Retrying..." : "Retry"}
        </Button>
      </motion.div>
    </div>
  )
}
