import { useMemo } from "react"
import { getCurrentUser } from "@/lib/auth"
import type { Meeting } from "@/types"

export function useCurrentUser() {
  return useMemo(() => getCurrentUser(), [])
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
