import { motion } from "framer-motion"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { FormEvent, useState } from "react"
import toast from "react-hot-toast"
import { Link, useNavigate } from "react-router-dom"
import { AuthSplitLayout } from "@/components/layout/auth-split-layout"
import { PageShell } from "@/components/shared/page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signInWithEmail } from "@/lib/auth"

interface FormState {
  email: string
  password: string
}

export function SignInPage() {
  const [form, setForm] = useState<FormState>({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setEmailError(undefined)
    setIsSubmitting(true)

    const user = signInWithEmail(form.email.trim())
    if (!user) {
      setIsSubmitting(false)
      setEmailError("No account found. Please sign up first.")
      return
    }
    toast.success("Welcome back!")
    navigate("/dashboard", { replace: true })
  }

  return (
    <PageShell>
      <AuthSplitLayout quote="Every meeting is a goldmine. Trace helps you dig it out.">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-[420px]"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">Welcome back</h1>
            <p className="mt-2 text-text-secondary">Sign in to your account</p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                  <Mail className="h-4 w-4" />
                </span>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Email"
                  className="pl-10"
                />
              </div>
              {emailError ? <p className="mt-1 text-sm text-[var(--danger)]">{emailError}</p> : null}
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <Lock className="h-4 w-4" />
              </span>
              <Input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="Password"
                className="pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="text-right">
              <button type="button" className="text-sm text-text-muted">
                Forgot password?
              </button>
            </div>

            <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in →"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary">
              Get started free
            </Link>
          </p>
        </motion.div>
      </AuthSplitLayout>
    </PageShell>
  )
}
