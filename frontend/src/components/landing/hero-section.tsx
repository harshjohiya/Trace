import { motion } from "framer-motion"
import { Search, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-28">
      <div className="pointer-events-none absolute right-[-180px] top-[-120px] h-[700px] w-[700px] rounded-full bg-[rgba(99,102,241,0.08)] blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-220px] left-[-160px] h-[500px] w-[500px] rounded-full bg-[rgba(139,92,246,0.08)] blur-[100px]" />
      <div className="page-enter relative z-10 py-16 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto inline-flex rounded-full border border-primary-border bg-primary-light px-4 py-1 text-sm font-semibold text-primary"
        >
          ✨ Turn any meeting into instant insights
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="mx-auto mt-6 max-w-4xl text-5xl font-extrabold leading-tight tracking-[-0.04em] text-text-primary sm:text-6xl lg:text-7xl"
        >
          Stop losing track of <br />
          <span className="relative inline-block">
            what matters
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute bottom-1 left-0 h-1 rounded bg-gradient-to-r from-primary to-[#8b5cf6]"
            />
          </span>
          <br />
          in your meetings.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary sm:text-xl"
        >
          Trace listens to your meetings so you don&apos;t have to. Upload any recording — get every
          action item, decision, and blocker extracted automatically. Then ask anything in plain
          English.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.45 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link to="/signup">
            <Button size="lg">Start for free →</Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="secondary" size="lg">
              See how it works
            </Button>
          </a>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.6 }}
          className="mt-5 text-sm text-text-muted"
        >
          Free to use · Runs locally · Your data stays private
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.7 }}
          className="relative mx-auto mt-20 max-w-5xl rounded-2xl border border-[#e4e0ff] bg-gradient-to-br from-[#f0f0ff] via-[#f5f3ff] to-[#fff0f8] p-5 shadow-hero"
        >
          <div className="rounded-xl border border-border-light bg-white">
            <div className="flex h-12 items-center justify-between border-b border-border-light px-4">
              <div className="font-semibold text-text-primary">Trace</div>
              <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                New Meeting
              </span>
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-5">
              <div className="space-y-3 md:col-span-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="rounded-lg border border-border-light p-3 text-left">
                    <h4 className="font-semibold text-text-primary">Meeting summary #{item}</h4>
                    <p className="mt-1 text-xs text-text-muted">Tasks · Decisions · Blockers</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3 rounded-lg border border-border-light p-3 md:col-span-2">
                <div className="flex items-center gap-2 rounded-md border border-border-light px-3 py-2 text-sm text-text-muted">
                  <Search className="h-4 w-4 text-primary" />
                  What are open action items?
                </div>
                <div className="rounded-md bg-bg-surface p-3 text-left text-sm text-text-secondary">
                  <p className="font-semibold text-text-primary">3 open action items found:</p>
                  <p className="mt-2">• Fix auth bug — Sarah — Due today</p>
                  <p>• Review designs — Mike</p>
                  <p>• Update docs — Team</p>
                </div>
              </div>
            </div>
          </div>

          <FloatingPill className="-top-5 left-5" delay={0} text="✅ Action items extracted" />
          <FloatingPill className="-top-5 right-5" delay={0.2} text="🎯 3 decisions captured" />
          <FloatingPill className="-bottom-5 right-12" delay={0.4} text="🔍 Ask in plain English" />
        </motion.div>
      </div>
    </section>
  )
}

function FloatingPill({ text, className, delay }: { text: string; className: string; delay: number }) {
  return (
    <motion.div
      animate={{ y: [-8, 8, -8] }}
      transition={{ duration: 3.6, repeat: Number.POSITIVE_INFINITY, delay, ease: "easeInOut" }}
      className={`absolute hidden rounded-xl border border-border-light bg-white px-4 py-2 text-sm shadow-md md:block ${className}`}
    >
      <div className="flex items-center gap-2 text-text-secondary">
        <Sparkles className="h-4 w-4 text-primary" />
        {text}
      </div>
    </motion.div>
  )
}
