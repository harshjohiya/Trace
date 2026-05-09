import { motion } from "framer-motion"
import { Search, Sparkles, ChevronRight, Play } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-bg-page pt-28 pb-20">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob" />
      <div className="absolute top-0 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-40 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob animation-delay-4000" />

      <div className="page-enter relative z-10 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary backdrop-blur-sm transition-colors hover:bg-primary/10"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          Turn any meeting into instant insights
          <ChevronRight className="h-4 w-4" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="mx-auto mt-8 max-w-5xl text-5xl font-extrabold leading-[1.1] tracking-tight text-text-primary sm:text-6xl lg:text-[5.5rem]"
        >
          Stop losing track of <br className="hidden sm:block" />
          <span className="relative inline-block mt-2">
            <span className="relative z-10 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              what matters
            </span>
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: 0.8, ease: "circOut" }}
              className="absolute -bottom-1 left-0 h-[6px] rounded-full bg-gradient-to-r from-primary/60 to-purple-500/60 blur-[2px]"
            />
          </span>
          <br className="hidden sm:block" />
          {" "}in your meetings.
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary sm:text-xl"
        >
          Trace listens to your meetings so you don&apos;t have to. Upload any recording — get every
          action item, decision, and blocker extracted automatically. Then ask anything in plain
          English.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link to="/signup">
            <Button size="lg" className="h-14 px-8 text-base shadow-primary hover:shadow-lg transition-shadow group rounded-full">
              Start for free
              <motion.span 
                className="ml-2 inline-block"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
              >
                →
              </motion.span>
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="outline" size="lg" className="h-14 px-8 text-base rounded-full bg-white/50 backdrop-blur-sm border-border-medium hover:bg-white/80 group">
              <Play className="mr-2 h-4 w-4 text-primary group-hover:text-primary-dark transition-colors" />
              See how it works
            </Button>
          </a>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-6 text-sm font-medium text-text-muted flex items-center justify-center gap-2"
        >
          <span className="flex items-center gap-1.5"><CheckIcon /> Free to use</span>
          <span className="text-border-strong">•</span>
          <span className="flex items-center gap-1.5"><CheckIcon /> Runs locally</span>
          <span className="text-border-strong">•</span>
          <span className="flex items-center gap-1.5"><CheckIcon /> Private</span>
        </motion.p>

        {/* Hero Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 70, damping: 20, delay: 0.7 }}
          className="relative mx-auto mt-20 max-w-5xl"
        >
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/20 blur-2xl transform -skew-y-2 scale-105 opacity-50"></div>
          
          <div className="relative rounded-2xl border border-white/40 bg-white/60 p-2 shadow-glass backdrop-blur-xl">
            <div className="rounded-xl border border-border-light bg-white/90 backdrop-blur shadow-sm overflow-hidden">
              <div className="flex h-14 items-center justify-between border-b border-border-light/50 bg-bg-surface/50 px-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                    <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                    <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <div className="ml-4 font-semibold text-text-primary text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Trace Workspace
                  </div>
                </div>
                <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary border border-primary/20 shadow-sm">
                  Live Analysis
                </span>
              </div>
              <div className="grid gap-4 p-5 md:grid-cols-5 bg-gradient-to-br from-white to-bg-surface/30">
                <div className="space-y-4 md:col-span-3">
                  {[1, 2, 3].map((item, i) => (
                    <motion.div 
                      key={item} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + (i * 0.1) }}
                      className="group rounded-xl border border-border-light/60 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md hover:border-primary/30"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-text-primary group-hover:text-primary transition-colors">Q2 Planning Meeting Summary</h4>
                          <p className="mt-1.5 text-xs font-medium text-text-muted flex gap-3">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Tasks</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Decisions</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Blockers</span>
                          </p>
                        </div>
                        <span className="text-xs text-text-muted bg-bg-surface px-2 py-1 rounded-md">2m ago</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 }}
                  className="space-y-3 rounded-xl border border-border-light/60 bg-white p-4 md:col-span-2 shadow-sm"
                >
                  <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm text-text-secondary focus-within:ring-2 ring-primary/20 transition-all">
                    <Search className="h-4 w-4 text-primary" />
                    <span className="opacity-70 text-sm">What are open action items?</span>
                    <div className="ml-auto flex items-center h-5 w-5 justify-center rounded bg-white shadow-sm border border-border-light text-[10px] text-text-muted font-mono">↵</div>
                  </div>
                  <div className="rounded-lg bg-bg-surface/80 p-4 text-left text-sm text-text-secondary border border-border-light/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <p className="font-semibold text-text-primary flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      3 open action items found:
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-start gap-2 bg-white p-2 rounded-md border border-border-light shadow-sm">
                        <input type="checkbox" className="mt-1 rounded border-border-strong text-primary focus:ring-primary" />
                        <div>
                          <p className="font-medium text-text-primary">Fix auth bug</p>
                          <p className="text-xs text-text-muted mt-0.5">Assigned to <span className="font-medium text-text-secondary">Sarah</span> • Due today</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-white p-2 rounded-md border border-border-light shadow-sm">
                        <input type="checkbox" className="mt-1 rounded border-border-strong text-primary focus:ring-primary" />
                        <div>
                          <p className="font-medium text-text-primary">Review new designs</p>
                          <p className="text-xs text-text-muted mt-0.5">Assigned to <span className="font-medium text-text-secondary">Mike</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <FloatingPill className="-top-6 -left-6 md:-left-12" delay={0} text="✅ Action items extracted" icon="check" />
          <FloatingPill className="top-1/4 -right-8 md:-right-16" delay={0.2} text="🎯 3 decisions captured" icon="target" />
          <FloatingPill className="-bottom-8 left-1/4" delay={0.4} text="🔍 Ask in plain English" icon="search" />
        </motion.div>
      </div>
    </section>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function FloatingPill({ text, className, delay, icon }: { text: string; className: string; delay: number, icon?: string }) {
  return (
    <motion.div
      animate={{ y: [-8, 8, -8] }}
      transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, delay, ease: "easeInOut" }}
      className={`absolute hidden rounded-xl border border-white/60 bg-white/80 backdrop-blur-md px-4 py-2.5 text-sm font-medium shadow-lg md:block z-20 ${className}`}
    >
      <div className="flex items-center gap-2 text-text-primary">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
          {icon === 'check' && <span className="text-xs">✅</span>}
          {icon === 'target' && <span className="text-xs">🎯</span>}
          {icon === 'search' && <span className="text-xs">🔍</span>}
          {!icon && <Sparkles className="h-3 w-3 text-primary" />}
        </div>
        {text}
      </div>
    </motion.div>
  )
}
