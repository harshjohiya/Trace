import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"

export function FinalCtaSection() {
  return (
    <section className="bg-bg-page px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl relative">
        <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-primary via-purple-500 to-pink-500 blur-xl opacity-30 animate-pulse"></div>
        
        <div className="relative rounded-3xl bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] px-6 py-20 text-center shadow-2xl sm:px-16 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px]"></div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl"
          >
            Ready to never lose a <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary-light via-white to-purple-200 bg-clip-text text-transparent">
              meeting insight
            </span> again?
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-white/70"
          >
            Upload your first recording in 30 seconds. No credit card required.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link to="/signup">
              <Button
                size="lg"
                className="h-14 px-8 rounded-full bg-white text-[#0f0f1a] font-bold shadow-lg hover:bg-gray-100 transition-all group"
              >
                Get started free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6 text-sm font-medium text-white/40"
          >
            Join 10,000+ teams already using Trace
          </motion.p>
        </div>
      </div>
    </section>
  )
}
