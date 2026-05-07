import { Badge } from "@/components/ui/badge"

const typeMap: Record<
  string,
  { label: string; variant: "indigo" | "blue" | "green" | "orange" | "gray" }
> = {
  onboarding: { label: "Onboarding", variant: "indigo" },
  planning: { label: "Planning", variant: "blue" },
  review: { label: "Review", variant: "green" },
  standup: { label: "Standup", variant: "orange" },
  discussion: { label: "Discussion", variant: "gray" },
}

export function TypeBadge({ type }: { type: string }) {
  const config = typeMap[type.toLowerCase()] ?? { label: type, variant: "gray" as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
