import { motion } from "framer-motion"

const useCases = [
  {
    emoji: "📋",
    role: "Project Manager",
    company: "TechFlow",
    quote:
      "I used to spend 30 minutes writing meeting notes. Now I upload the recording and everything is ready.",
    tags: ["Action tracking", "Deadlines"],
  },
  {
    emoji: "🚀",
    role: "Startup Founder",
    company: "Nexia",
    quote:
      "We run 15+ meetings a week. Trace is the only reason I know what was actually decided in each one.",
    tags: ["Decision history", "Search"],
  },
  {
    emoji: "⚙️",
    role: "Engineering Lead",
    company: "Quantum",
    quote:
      "The blocker detection catches things people forget to mention in standup. It's saved us multiple times.",
    tags: ["Blocker detection", "Planning"],
  },
  {
    emoji: "💼",
    role: "Sales Director",
    company: "Elevate",
    quote:
      "Being able to ask 'what objections did they have?' across 50 sales calls is a complete game-changer.",
    tags: ["AI Search", "Insights"],
  },
  {
    emoji: "🎨",
    role: "Design Lead",
    company: "Studio 9",
    quote:
      "We never lose feedback anymore. It's all transcribed, categorized, and searchable instantly.",
    tags: ["Feedback", "Accountability"],
  },
]

export function UseCasesSection() {
  return (
    <section className="bg-white py-32 overflow-hidden border-y border-border-light/50">
      <div className="page-enter">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em] text-primary"
          >
            Who uses trace
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-4xl font-bold tracking-tight text-text-primary sm:text-5xl"
          >
            Loved by fast-moving teams
          </motion.h2>
        </div>
      </div>

      <div className="mt-20 relative flex max-w-[100vw] overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-white to-transparent"></div>
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-white to-transparent"></div>
        
        <div className="flex w-max animate-infinite-scroll hover:[animation-play-state:paused]">
          {[...useCases, ...useCases].map((item, index) => (
            <div key={index} className="mx-4 w-[400px] shrink-0">
              <div className="h-full rounded-2xl border border-border-light bg-bg-surface p-8 transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
                    {item.emoji}
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary">{item.role}</h4>
                    <p className="text-sm font-medium text-text-muted">{item.company}</p>
                  </div>
                </div>
                <p className="mt-6 text-[15px] leading-relaxed text-text-secondary italic">"{item.quote}"</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-white border border-border-light px-2.5 py-1 text-xs font-medium text-text-secondary shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
