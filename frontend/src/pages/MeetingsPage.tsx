import { motion } from "framer-motion"
import { FolderOpen, Upload, Calendar, Clock, ArrowRight } from "lucide-react"
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
import { listMeetings } from "@/api"
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
    <PageShell className="space-y-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-purple-500/5 to-transparent -z-10 pointer-events-none" />
      <div className="fixed -left-40 top-40 h-96 w-96 rounded-full bg-primary/10 mix-blend-multiply blur-[100px] animate-blob -z-10 pointer-events-none" />
      <div className="fixed right-0 bottom-0 h-96 w-96 rounded-full bg-pink-500/10 mix-blend-multiply blur-[100px] animate-blob animation-delay-2000 -z-10 pointer-events-none" />
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">My Meetings</h1>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {meetings.length}
          </div>
        </div>
        <Link to="/dashboard">
          <Button variant="primary" className="shadow-md hover:shadow-lg">
            <Upload className="mr-2 h-4 w-4" />
            Upload meeting
          </Button>
        </Link>
      </section>

      <Card className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between shadow-sm">
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((item) => {
            const active = item === filter
            return (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "border-primary bg-primary text-white shadow-md scale-105"
                    : "border-border-medium bg-white text-text-secondary hover:border-primary/50 hover:bg-bg-surface hover:text-primary"
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
          className="h-10 rounded-xl border border-border-medium px-4 text-sm font-medium text-text-secondary outline-none transition-colors hover:border-primary focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="tasks">Most tasks</option>
        </select>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => void fetchData()} />
      ) : visibleMeetings.length === 0 ? (
        <EmptyState
          title="No meetings yet"
          message="Upload your first recording to see it here"
          actionLabel="Upload meeting"
          onAction={() => {
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
          icon={<FolderOpen className="h-10 w-10 text-primary" />}
        />
      ) : (
        <div className="space-y-4">
          {visibleMeetings.map((meeting, index) => (
            <motion.div
              key={meeting.meeting_id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            >
              <Card className="group relative flex flex-col gap-4 border-l-4 border-l-primary p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/50 overflow-hidden md:flex-row md:items-center md:justify-between bg-white rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10 space-y-3">
                  <h2 className="text-xl font-bold text-text-primary">{meeting.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-text-muted">
                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatDate(meeting.created_at)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {formatDuration(meeting.duration_sec)}</span>
                    <TypeBadge type={meeting.meeting_type} />
                  </div>
                  <div className="flex items-center gap-2">
                    {meeting.speakers.slice(0, 5).map((speaker, speakerIndex) => (
                      <SpeakerAvatar
                        key={speaker}
                        name={speaker}
                        size="sm"
                        className={speakerIndex > 0 ? "-ml-3 border-2 border-white ring-2 ring-white/50" : "ring-2 ring-white/50"}
                      />
                    ))}
                  </div>
                </div>
                <div className="relative z-10 flex flex-col items-start gap-4 md:items-end">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="green" className="shadow-sm">{meeting.action_items} tasks</Badge>
                    <Badge variant="blue" className="shadow-sm">{meeting.decisions} decisions</Badge>
                    {meeting.blockers > 0 ? <Badge variant="red" className="shadow-sm">{meeting.blockers} blockers</Badge> : null}
                  </div>
                  <Link to={`/meetings/${meeting.meeting_id}`}>
                    <Button variant="secondary" className="group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm rounded-xl">
                      Open meeting <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
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
