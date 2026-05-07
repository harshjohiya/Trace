import type { ButtonHTMLAttributes } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface TabItem<T extends string> {
  key: T
  label: string
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function Tabs<T extends string>({ tabs, value, onChange, className }: TabsProps<T>) {
  return (
    <div className={cn("border-b border-border-light", className)}>
      <div className="flex flex-wrap gap-2 sm:gap-4">
        {tabs.map((tab) => (
          <TabButton key={tab.key} isActive={tab.key === value} onClick={() => onChange(tab.key)}>
            {tab.label}
          </TabButton>
        ))}
      </div>
    </div>
  )
}

function TabButton({
  isActive,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { isActive: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "relative pb-3 text-sm transition-colors sm:text-base",
        isActive ? "font-semibold text-primary" : "text-text-muted hover:text-text-secondary",
        className,
      )}
      {...props}
    >
      {children}
      {isActive ? (
        <motion.span
          layoutId="tab-indicator"
          className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-primary"
        />
      ) : null}
    </button>
  )
}
