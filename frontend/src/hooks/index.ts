import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { getCurrentUser } from "@/lib/auth"
import type { Meeting } from "@/types"

export function useCurrentUser() {
  return useMemo(() => getCurrentUser(), [])
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = typeof window !== "undefined" ? window.localStorage.getItem(key) : null
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    try {
      setStoredValue((previousValue) => {
        const valueToStore = typeof value === "function"
          ? (value as (currentValue: T) => T)(previousValue)
          : value
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
        return valueToStore
      })
    } catch {
      console.error(`Failed to save to localStorage: ${key}`)
    }
  }

  return [storedValue, setValue]
}

export function useMeetingStats(meetings: Meeting[]) {
  return useMemo(
    () =>
      meetings.reduce(
        (acc, meeting) => {
          acc.meetings += 1
          acc.actionItems += meeting.action_items
          acc.decisions += meeting.decisions
          acc.blockers += meeting.blockers
          return acc
        },
        { meetings: 0, actionItems: 0, decisions: 0, blockers: 0 },
      ),
    [meetings],
  )
}
