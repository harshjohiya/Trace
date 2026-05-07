import { cn } from "@/lib/utils"

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-[linear-gradient(90deg,#f0f0f8_25%,#e8e8f4_50%,#f0f0f8_75%)] bg-[length:200%_100%]",
        className,
      )}
    />
  )
}
