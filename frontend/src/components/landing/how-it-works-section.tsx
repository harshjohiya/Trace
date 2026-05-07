import { motion } from "framer-motion"
import { AudioLines, Search, Sparkles, UploadCloud } from "lucide-react"
import { Card } from "@/components/ui/card"

const steps = [
  {
    icon: UploadCloud,
    title: "Upload recording",
    body: "Any audio or video format. Drag, drop, done.",
  },
  {
    icon: AudioLines,
    title: "AI transcribes",
    body: "Every word. Every speaker. Timestamped precisely.",
  },
  {
    icon: Sparkles,
    title: "Insights extracted",
    body: "Tasks, decisions, blockers with owners and deadlines.",
  },
  {
    icon: Search,
    title: "Ask anything",
    body: "Natural language search across all your meetings.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-bg-surface py-24">
      <div className="page-enter">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-primary">How it works</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-text-primary">Simple as dropping a file</h2>
          <p className="mt-3 text-text-secondary">No setup. No training. Upload and go.</p>
        </div>
        <div className="relative mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: index * 0.1 }}
              >
                <Card className="h-full p-8 text-center">
                  <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                    {index + 1}
                  </span>
                  <span className="mx-auto inline-flex rounded-full bg-primary-light p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-text-primary">{step.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{step.body}</p>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
