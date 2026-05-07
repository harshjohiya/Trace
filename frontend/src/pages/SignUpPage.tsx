import { motion } from "framer-motion"
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react"
import { FormEvent, type ReactNode, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { Link, useNavigate } from "react-router-dom"
import { AuthSplitLayout } from "@/components/layout/auth-split-layout"
import { PageShell } from "@/components/shared/page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { saveAccount } from "@/lib/auth"

interface FormState {
  name: string
  email: string
  password: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
}

export function SignUpPage() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", password: "" })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const canSubmit = useMemo(
    () => Boolean(form.name.trim() && form.email.trim() && form.password.trim()),
    [form.email, form.name, form.password],
  )

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {}
    if (!form.name.trim()) nextErrors.name = "Name is required."
    if (!form.email.trim()) nextErrors.email = "Email is required."
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email."
    if (!form.password.trim()) nextErrors.password = "Password is required."
    if (form.password && form.password.length < 8) nextErrors.password = "Password must be at least 8 characters."
    return nextErrors
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    const createdAt = new Date().toISOString()
    saveAccount({ name: form.name.trim(), email: form.email.trim(), createdAt })
    toast.success("Welcome to Trace!")
    navigate("/dashboard", { replace: true })
  }

  return (
    <PageShell>
      <AuthSplitLayout quote="Your meetings are full of decisions waiting to be found.">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-[420px]"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">Create your account</h1>
            <p className="mt-2 text-text-secondary">Start extracting insights from meetings</p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <Field icon={<User className="h-4 w-4" />} error={errors.name}>
              <Input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Full name"
              />
            </Field>
            <Field icon={<Mail className="h-4 w-4" />} error={errors.email}>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Email"
              />
            </Field>
            <Field icon={<Lock className="h-4 w-4" />} error={errors.password}>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} disabled={!canSubmit}>
              {isSubmitting ? "Creating account..." : "Create account →"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link to="/signin" className="font-semibold text-primary">
              Sign in
            </Link>
          </p>
          <p className="mt-8 text-center text-sm text-text-muted">
            Your data stays on your machine. We never store your recordings.
          </p>
        </motion.div>
      </AuthSplitLayout>
    </PageShell>
  )
}

function Field({
  icon,
  children,
  error,
}: {
  icon: ReactNode
  children: ReactNode
  error?: string
}) {
  return (
    <div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          {icon}
        </span>
        <div className="[&>input]:pl-10">{children}</div>
      </div>
      {error ? <p className="mt-1 text-sm text-[var(--danger)]">{error}</p> : null}
    </div>
  )
}
