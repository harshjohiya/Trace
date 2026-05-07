import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function FinalCtaSection() {
  return (
    <section className="bg-white px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px] rounded-2xl bg-gradient-to-br from-primary to-[#8b5cf6] px-6 py-16 text-center shadow-hero sm:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl"
        >
          Ready to never lose a meeting insight again?
        </motion.h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/75">
          Upload your first recording in 30 seconds.
        </p>
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className="mt-8">
          <Link to="/signup">
            <Button
              size="lg"
              className="bg-white font-bold text-primary shadow-lg hover:bg-white hover:text-primary-dark"
            >
              Get started free →
            </Button>
          </Link>
        </motion.div>
        <p className="mt-4 text-sm text-white/50">No account required to try</p>
      </div>
    </section>
  )
}
