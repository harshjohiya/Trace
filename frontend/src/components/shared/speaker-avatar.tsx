import { cn, getInitials, nameToColorIndex } from "@/lib/utils"

const palette = [
  "bg-[#eef2ff] text-[#6366f1]",
  "bg-[#f0fdfa] text-[#0d9488]",
  "bg-[#fff7ed] text-[#ea580c]",
  "bg-[#faf5ff] text-[#9333ea]",
  "bg-[#f0fdf4] text-[#16a34a]",
  "bg-[#fdf2f8] text-[#db2777]",
  "bg-[#fffbeb] text-[#d97706]",
  "bg-[#ecfeff] text-[#0891b2]",
]

type AvatarSize = "sm" | "md" | "lg"

const sizeMap: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
}

export function SpeakerAvatar({
  name,
  size = "md",
  className,
}: {
  name: string
  size?: AvatarSize
  className?: string
}) {
  const color = palette[nameToColorIndex(name, palette.length)]
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold",
        sizeMap[size],
        color,
        className,
      )}
      title={name}
      aria-label={name}
    >
      {getInitials(name)}
    </span>
  )
}
