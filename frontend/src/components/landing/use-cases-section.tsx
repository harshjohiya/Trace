import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const useCases = [
  {
    emoji: "📋",
    role: "Project Manager",
    quote:
      "I used to spend 30 minutes writing meeting notes. Now I upload the recording and everything is ready.",
    tags: ["Action tracking", "Deadlines", "Accountability"],
  },
  {
    emoji: "🚀",
    role: "Startup Founder",
    quote:
      "We run 15+ meetings a week. Trace is the only reason I know what was actually decided in each one.",
    tags: ["Decision history", "Cross-meeting search"],
  },
  {
    emoji: "⚙️",
    role: "Engineering Lead",
    quote:
      "The blocker detection catches things people forget to mention in standup. It's saved us multiple times.",
    tags: ["Blocker detection", "Sprint planning"],
  },
]

export function UseCasesSection() {
  return (
    <section className="bg-bg-surface py-24">
      <div className="page-enter">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-primary">Who uses trace</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-text-primary">
            Built for teams who move fast
          </h2>
        </div>
        <div className="mt-12 grid gap-6 xl:grid-cols-3">
          {useCases.map((item, index) => (
            <motion.div
              key={item.role}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.15 } }}
            >
              <Card className="h-full rounded-xl p-10 transition-all duration-200 hover:shadow-lg">
                <p className="text-5xl">{item.emoji}</p>
                <Badge variant="gray" className="mt-5">
                  {item.role}
                </Badge>
                <p className="mt-4 leading-relaxed text-text-secondary">{item.quote}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="indigo">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
