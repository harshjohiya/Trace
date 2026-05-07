import type { AuthUser } from "@/types"

const CURRENT_USER_KEY = "trace_user"
const ACCOUNTS_KEY = "trace_accounts"

export function getCurrentUser(): AuthUser | null {
  const raw = localStorage.getItem(CURRENT_USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getCurrentUser()?.token)
}

export function signOut(): void {
  localStorage.removeItem(CURRENT_USER_KEY)
}

export function getAccounts(): AuthUser[] {
  const raw = localStorage.getItem(ACCOUNTS_KEY)
  if (!raw) return []
  try {
    const accounts = JSON.parse(raw) as AuthUser[]
    return Array.isArray(accounts) ? accounts : []
  } catch {
    return []
  }
}

export function saveAccount(user: Omit<AuthUser, "token">): AuthUser {
  const account: AuthUser = { ...user, token: "local-session" }
  const nextAccounts = [...getAccounts().filter((item) => item.email !== user.email), account]
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts))
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(account))
  return account
}

export function signInWithEmail(email: string): AuthUser | null {
  const account = getAccounts().find((item) => item.email.toLowerCase() === email.toLowerCase())
  if (!account) return null
  const user: AuthUser = { ...account, token: "local-session" }
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  return user
}
