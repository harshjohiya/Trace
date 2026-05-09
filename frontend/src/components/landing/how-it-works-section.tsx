import { motion } from "framer-motion"
import { AudioLines, Search, Sparkles, UploadCloud } from "lucide-react"

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
    <section id="how-it-works" className="bg-white py-32 relative">
      <div className="page-enter">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em] text-primary"
          >
            How it works
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-4xl font-bold tracking-tight text-text-primary sm:text-5xl"
          >
            Simple as dropping a file
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-text-secondary"
          >
            No setup. No training. Upload and go.
          </motion.p>
        </div>
        
        <div className="relative mt-20">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border-light -translate-y-1/2 hidden lg:block"></div>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500 -translate-y-1/2 hidden lg:block"
          ></motion.div>

          <div className="grid gap-10 lg:grid-cols-4 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="relative group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 rounded-full bg-primary/20 blur-md scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-border-light bg-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:border-primary/30 group-hover:shadow-md">
                        <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-sm font-bold text-white shadow-sm">
                          {index + 1}
                        </span>
                        <Icon className="h-8 w-8 text-primary group-hover:text-purple-600 transition-colors" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-text-primary">{step.title}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-text-secondary max-w-[250px]">{step.body}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
