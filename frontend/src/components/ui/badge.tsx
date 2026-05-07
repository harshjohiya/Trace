import { cva, type VariantProps } from "class-variance-authority"
import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-[10px] py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        indigo: "border-[var(--primary-border)] bg-[var(--primary-light)] text-[var(--primary)]",
        green: "border-[var(--success-border)] bg-[var(--success-light)] text-[var(--success)]",
        blue: "border-[var(--info-border)] bg-[var(--info-light)] text-[var(--info)]",
        orange: "border-[var(--warning-border)] bg-[var(--warning-light)] text-[var(--warning)]",
        red: "border-[var(--danger-border)] bg-[var(--danger-light)] text-[var(--danger)]",
        gray: "border-border-medium bg-bg-surface text-text-secondary",
      },
    },
    defaultVariants: {
      variant: "gray",
    },
  },
)

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
