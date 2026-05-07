import { motion } from "framer-motion"
import { AlertTriangle, Brain, CheckCircle2, MessageSquare, Users, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"

const features = [
  {
    icon: Users,
    title: "Speaker identification",
    body: "Automatically knows who said what. No manual labeling needed.",
    iconClass: "bg-primary-light text-primary",
  },
  {
    icon: CheckCircle2,
    title: "Action item extraction",
    body: "Every task captured with owner and deadline. Nothing slips through.",
    iconClass: "bg-[var(--success-light)] text-[var(--success)]",
  },
  {
    icon: Zap,
    title: "Decision tracking",
    body: "Full history of every decision. Know why things were decided.",
    iconClass: "bg-[var(--info-light)] text-[var(--info)]",
  },
  {
    icon: AlertTriangle,
    title: "Blocker detection",
    body: "Surface problems before they become crises. Stay unblocked.",
    iconClass: "bg-[#fff7ed] text-[#d97706]",
  },
  {
    icon: MessageSquare,
    title: "Natural language search",
    body: "Ask like you'd ask a colleague. Get real answers from meetings.",
    iconClass: "bg-[#faf5ff] text-[#9333ea]",
  },
  {
    icon: Brain,
    title: "Persistent memory",
    body: "Every meeting indexed forever. Search across months of history.",
    iconClass: "bg-[#f0fdfa] text-[#0d9488]",
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-white py-24">
      <div className="page-enter">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-primary">Features</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-text-primary">Everything in one place</h2>
          <p className="mt-3 text-text-secondary">
            Built for teams who can&apos;t afford to lose context between meetings.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.15 } }}
              >
                <Card className="h-full p-7 transition-all duration-200 hover:border-primary-border hover:shadow-lg">
                  <span className={`inline-flex rounded-xl p-3 ${feature.iconClass}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-text-primary">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">{feature.body}</p>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
