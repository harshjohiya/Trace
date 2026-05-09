import { motion } from "framer-motion"
import { AlertTriangle, Brain, CheckCircle2, MessageSquare, Users, Zap } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Speaker identification",
    body: "Automatically knows who said what. No manual labeling needed.",
    iconClass: "bg-primary-light text-primary border border-primary/20",
    gradient: "from-primary/10 to-transparent",
  },
  {
    icon: CheckCircle2,
    title: "Action item extraction",
    body: "Every task captured with owner and deadline. Nothing slips through.",
    iconClass: "bg-[var(--success-light)] text-[var(--success)] border border-[var(--success)]/20",
    gradient: "from-[var(--success)]/10 to-transparent",
  },
  {
    icon: Zap,
    title: "Decision tracking",
    body: "Full history of every decision. Know why things were decided.",
    iconClass: "bg-[var(--info-light)] text-[var(--info)] border border-[var(--info)]/20",
    gradient: "from-[var(--info)]/10 to-transparent",
  },
  {
    icon: AlertTriangle,
    title: "Blocker detection",
    body: "Surface problems before they become crises. Stay unblocked.",
    iconClass: "bg-[#fff7ed] text-[#d97706] border border-[#d97706]/20",
    gradient: "from-[#d97706]/10 to-transparent",
  },
  {
    icon: MessageSquare,
    title: "Natural language search",
    body: "Ask like you'd ask a colleague. Get real answers from meetings.",
    iconClass: "bg-[#faf5ff] text-[#9333ea] border border-[#9333ea]/20",
    gradient: "from-[#9333ea]/10 to-transparent",
  },
  {
    icon: Brain,
    title: "Persistent memory",
    body: "Every meeting indexed forever. Search across months of history.",
    iconClass: "bg-[#f0fdfa] text-[#0d9488] border border-[#0d9488]/20",
    gradient: "from-[#0d9488]/10 to-transparent",
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-bg-surface py-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-60"></div>
      
      <div className="page-enter relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em] text-primary"
          >
            Features
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-4xl font-bold tracking-tight text-text-primary sm:text-5xl"
          >
            Everything in one place
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-text-secondary max-w-xl mx-auto"
          >
            Built for teams who can&apos;t afford to lose context between meetings.
          </motion.p>
        </div>
        
        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-xl -z-10" />
                <div className="h-full relative overflow-hidden rounded-2xl border border-border-light bg-white p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} rounded-bl-[100px] opacity-50 transition-transform duration-500 group-hover:scale-110`}></div>
                  
                  <span className={`inline-flex items-center justify-center rounded-xl p-3 shadow-sm transition-transform duration-300 group-hover:scale-110 ${feature.iconClass}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-6 text-xl font-bold text-text-primary">{feature.title}</h3>
                  <p className="mt-3 leading-relaxed text-text-secondary">{feature.body}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
