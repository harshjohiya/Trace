import { motion } from "framer-motion"
import { FolderOpen, Upload } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { PageShell } from "@/components/shared/page-shell"
import { Skeleton } from "@/components/shared/skeleton"
import { SpeakerAvatar } from "@/components/shared/speaker-avatar"
import { TypeBadge } from "@/components/shared/type-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { listMeetings } from "@/lib/api"
import { formatDate, formatDuration } from "@/lib/utils"
import type { ApiClientError, Meeting } from "@/types"

type SortType = "newest" | "oldest" | "tasks"

const typeFilters = ["all", "onboarding", "planning", "review", "standup", "discussion"] as const

export function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [filter, setFilter] = useState<(typeof typeFilters)[number]>("all")
  const [sort, setSort] = useState<SortType>("newest")

  const fetchData = async () => {
    setIsLoading(true)
    setError(undefined)
    try {
      const response = await listMeetings()
      setMeetings(response.meetings)
    } catch (apiError) {
      setError((apiError as ApiClientError).message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchData()
  }, [])

  const visibleMeetings = useMemo(() => {
    const filtered =
      filter === "all" ? meetings : meetings.filter((meeting) => meeting.meeting_type.toLowerCase() === filter)
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return b.action_items - a.action_items
    })
    return sorted
  }, [filter, meetings, sort])

  return (
    <PageShell className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">My Meetings</h1>
          <Badge variant="gray">{meetings.length}</Badge>
        </div>
        <Link to="/dashboard">
          <Button variant="primary">
            <Upload className="mr-2 h-4 w-4" />
            Upload meeting
          </Button>
        </Link>
      </section>

      <Card className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((item) => {
            const active = item === filter
            return (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-border-medium bg-white text-text-secondary hover:border-primary hover:text-primary"
                }`}
              >
                {item === "all" ? "All" : item[0].toUpperCase() + item.slice(1)}
              </button>
            )
          })}
        </div>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortType)}
          className="h-10 rounded-[10px] border border-border-medium px-3 text-sm text-text-secondary outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="tasks">Most tasks</option>
        </select>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => void fetchData()} />
      ) : visibleMeetings.length === 0 ? (
        <EmptyState
          title="No meetings yet"
          message="Upload your first recording"
          actionLabel="Upload meeting"
          onAction={() => {
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
          icon={<FolderOpen className="h-8 w-8 text-text-muted" />}
        />
      ) : (
        <div className="space-y-3">
          {visibleMeetings.map((meeting, index) => (
            <motion.div
              key={meeting.meeting_id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
            >
              <Card className="flex flex-col gap-4 border-l-4 border-l-primary p-6 transition-all duration-200 hover:border-primary-border hover:shadow-md md:flex-row md:items-center md:justify-between">
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-text-primary">{meeting.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
                    <span>{formatDate(meeting.created_at)}</span>
                    <span>·</span>
                    <span>{formatDuration(meeting.duration_sec)}</span>
                    <TypeBadge type={meeting.meeting_type} />
                  </div>
                  <div className="flex items-center gap-2">
                    {meeting.speakers.slice(0, 5).map((speaker, speakerIndex) => (
                      <SpeakerAvatar
                        key={speaker}
                        name={speaker}
                        size="sm"
                        className={speakerIndex > 0 ? "-ml-3 border-2 border-white" : ""}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-start gap-3 md:items-end">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="green">{meeting.action_items} tasks</Badge>
                    <Badge variant="blue">{meeting.decisions} decisions</Badge>
                    {meeting.blockers > 0 ? <Badge variant="red">{meeting.blockers} blockers</Badge> : null}
                  </div>
                  <Link to={`/meetings/${meeting.meeting_id}`}>
                    <Button variant="secondary">Open →</Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
