import { type TextareaHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-[10px] border border-border-medium bg-white px-4 py-3 text-[15px] text-text-primary outline-none placeholder:text-text-muted transition-all duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]",
      className,
    )}
    {...props}
  />
))

Textarea.displayName = "Textarea"
