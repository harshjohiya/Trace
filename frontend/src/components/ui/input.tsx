import { type InputHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-[10px] border border-border-medium bg-white px-4 text-[15px] text-text-primary outline-none placeholder:text-text-muted transition-all duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]",
        className,
      )}
      {...props}
    />
  ),
)

Input.displayName = "Input"
