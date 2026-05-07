import { cva, type VariantProps } from "class-variance-authority"
import { type ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-[10px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary px-6 py-3 text-white shadow-primary hover:bg-primary-dark hover:shadow-[0_4px_20px_rgba(99,102,241,0.35)] active:scale-[0.98]",
        secondary:
          "border border-border-medium bg-white px-6 py-3 text-text-secondary hover:border-primary hover:text-primary",
        ghost: "bg-transparent px-4 py-2 text-text-secondary hover:bg-bg-elevated",
        danger:
          "border border-[var(--danger-border)] bg-white px-6 py-3 text-[var(--danger)] hover:border-[var(--danger)] hover:bg-[var(--danger-light)]",
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-[15px]",
        lg: "px-8 py-4 text-base",
        xl: "px-10 py-[18px] text-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean
  }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, isLoading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </button>
  ),
)

Button.displayName = "Button"
