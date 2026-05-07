import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Layers,
  Send,
  Sparkles,
  Upload,
  UploadCloud,
  Zap,
} from "lucide-react"
import { type DragEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react"
import toast from "react-hot-toast"
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
import { Input } from "@/components/ui/input"
import { getCurrentUser } from "@/lib/auth"
import { getJobStatus, healthCheck, listMeetings, queryMeetings, uploadMeeting } from "@/lib/api"
import { formatDate, formatDuration, getGreetingByHour } from "@/lib/utils"
import type { ApiClientError, JobStatus, Meeting, QueryResponse } from "@/types"

interface UploadState {
  file: File
  jobId: string | null
  progress: number
  status: JobStatus["status"] | "idle"
}

export function DashboardPage() {
  const user = getCurrentUser()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [healthOffline, setHealthOffline] = useState(false)

  const [uploadState, setUploadState] = useState<UploadState | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const [question, setQuestion] = useState("")
  const [queryLoading, setQueryLoading] = useState(false)
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null)

  const pollTimer = useRef<number | null>(null)
  const fileInputId = "dashboard-upload-input"

  const stats = useMemo(
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

  async function fetchMeetings() {
    setIsLoading(true)
    setError(undefined)
    try {
      const response = await listMeetings()
      const sorted = [...response.meetings].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      setMeetings(sorted)
    } catch (apiError) {
      setError((apiError as ApiClientError).message)
    } finally {
      setIsLoading(false)
    }
  }

  async function checkHealth() {
    try {
      await healthCheck()
      setHealthOffline(false)
    } catch {
      setHealthOffline(true)
    }
  }

  useEffect(() => {
    void fetchMeetings()
    void checkHealth()
  }, [])

  useEffect(
    () => () => {
      if (pollTimer.current) {
        window.clearInterval(pollTimer.current)
      }
    },
    [],
  )

  const retryAll = () => {
    void fetchMeetings()
    void checkHealth()
  }

  const onFileChange = (file: File | null) => {
    if (!file) return
    setUploadState({
      file,
      jobId: null,
      progress: 0,
      status: "idle",
    })
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    const file = event.dataTransfer.files?.[0]
    onFileChange(file ?? null)
  }

  const startPolling = (jobId: string) => {
    if (pollTimer.current) {
      window.clearInterval(pollTimer.current)
    }
    pollTimer.current = window.setInterval(async () => {
      try {
        const job = await getJobStatus(jobId)
        setUploadState((prev) =>
          prev
            ? {
                ...prev,
                status: job.status,
                progress: job.progress,
              }
            : prev,
        )
        if (job.status === "completed") {
          if (pollTimer.current) window.clearInterval(pollTimer.current)
          toast.success("✓ Meeting processed! Ready to explore.")
          setTimeout(() => {
            setUploadState(null)
            void fetchMeetings()
          }, 2000)
        }
        if (job.status === "failed") {
          if (pollTimer.current) window.clearInterval(pollTimer.current)
          toast.error(job.error ?? "Meeting processing failed.")
          setUploadState(null)
        }
      } catch (apiError) {
        toast.error((apiError as ApiClientError).message)
      }
    }, 6000)
  }

  const handleProcessUpload = async () => {
    if (!uploadState?.file) return
    try {
      const response = await uploadMeeting(uploadState.file)
      setUploadState((prev) =>
        prev
          ? {
              ...prev,
              jobId: response.job_id,
              status: "queued",
              progress: 0,
            }
          : prev,
      )
      startPolling(response.job_id)
    } catch (apiError) {
      toast.error((apiError as ApiClientError).message)
    }
  }

  const handleQuickAsk = async () => {
    if (!question.trim()) return
    setQueryLoading(true)
    try {
      const response = await queryMeetings({ question: question.trim() })
      if ("answer" in response) {
        setQueryResult(response)
      } else {
        setQueryResult({
          question: response.question,
          answer: `Found ${response.count} ${response.filter_type} results.`,
          confidence: "medium",
          sources: [],
        })
      }
      setQuestion("")
    } catch (apiError) {
      toast.error((apiError as ApiClientError).message)
    } finally {
      setQueryLoading(false)
    }
  }

  return (
    <PageShell className="space-y-8 pb-24">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            {getGreetingByHour()}, {user?.name ?? "there"}
          </h1>
          <p className="mt-2 text-text-secondary">Here&apos;s what&apos;s happening across your meetings.</p>
        </div>
        <label htmlFor={fileInputId}>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload meeting
          </Button>
        </label>
      </section>

      {healthOffline ? (
        <Card className="border-[var(--warning-border)] bg-[var(--warning-light)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-medium text-[var(--warning)]">
              ⚠ Backend offline — start the server to process meetings
            </p>
            <Button variant="secondary" size="sm" onClick={retryAll}>
              Retry
            </Button>
          </div>
          <pre className="mt-2 rounded bg-white px-3 py-2 font-mono text-sm text-text-secondary">
            uvicorn backend.main:app --reload
          </pre>
        </Card>
      ) : null}

      {isLoading ? (
        <StatsSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={retryAll} />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Meetings processed"
            value={stats.meetings}
            subtext="Total recordings analyzed"
            icon={<Layers className="h-5 w-5 text-primary" />}
            iconClass="bg-primary-light"
          />
          <StatCard
            title="Action items logged"
            value={stats.actionItems}
            subtext="Across all meetings"
            icon={<CheckCircle2 className="h-5 w-5 text-[var(--success)]" />}
            iconClass="bg-[var(--success-light)]"
          />
          <StatCard
            title="Decisions captured"
            value={stats.decisions}
            subtext="Recorded and searchable"
            icon={<Zap className="h-5 w-5 text-[var(--info)]" />}
            iconClass="bg-[var(--info-light)]"
          />
          <StatCard
            title="Active blockers"
            value={stats.blockers}
            subtext={stats.blockers > 0 ? "Need attention" : "All clear"}
            icon={<AlertTriangle className="h-5 w-5 text-[var(--danger)]" />}
            iconClass={stats.blockers > 0 ? "bg-[var(--danger-light)]" : "bg-[var(--success-light)]"}
          />
        </section>
      )}

      <section>
        <UploadCard
          uploadState={uploadState}
          isDragOver={isDragOver}
          fileInputId={fileInputId}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
          onFileChange={onFileChange}
          onProcessUpload={handleProcessUpload}
          onReset={() => setUploadState(null)}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">Recent Meetings</h2>
          <Link to="/meetings" className="text-sm font-semibold text-primary">
            View all →
          </Link>
        </div>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <EmptyState
            title="No meetings yet"
            message="Upload your first recording to start extracting insights."
            actionLabel="Upload meeting"
            onAction={() => document.getElementById(fileInputId)?.click()}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {meetings.slice(0, 4).map((meeting, index) => (
              <motion.div
                key={meeting.meeting_id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.15 } }}
              >
                <Link to={`/meetings/${meeting.meeting_id}`}>
                  <Card className="h-full space-y-4 transition-all duration-200 hover:border-primary-border hover:shadow-lg">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 text-lg font-semibold text-text-primary">{meeting.title}</h3>
                      <TypeBadge type={meeting.meeting_type} />
                    </div>
                    <p className="text-sm text-text-muted">
                      {formatDate(meeting.created_at)} · {formatDuration(meeting.duration_sec)}
                    </p>
                    <div className="flex items-center gap-2">
                      {meeting.speakers.slice(0, 4).map((speaker, speakerIndex) => (
                        <SpeakerAvatar
                          key={speaker}
                          name={speaker}
                          size="sm"
                          className={speakerIndex > 0 ? "-ml-3 border-2 border-white" : ""}
                        />
                      ))}
                      {meeting.speakers.length > 4 ? (
                        <span className="text-xs text-text-muted">+{meeting.speakers.length - 4}</span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="green">{meeting.action_items} tasks</Badge>
                      <Badge variant="blue">{meeting.decisions} decisions</Badge>
                      {meeting.blockers > 0 ? <Badge variant="red">{meeting.blockers} blockers</Badge> : null}
                    </div>
                    <p className="text-sm font-semibold text-primary">Open meeting →</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="fixed inset-x-0 bottom-0 z-40 border-t border-border-light bg-white/90 p-4 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[640px] items-center gap-2">
          <div className="relative flex-1">
            <Sparkles className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <Input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask anything about your meetings..."
              className="pl-10 pr-12"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  void handleQuickAsk()
                }
              }}
            />
            <button
              type="button"
              onClick={() => void handleQuickAsk()}
              className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {queryLoading || queryResult ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 z-50 w-[min(460px,calc(100%-2rem))] rounded-t-2xl border border-border-light bg-white p-5 shadow-xl"
          >
            {queryLoading ? (
              <p className="text-sm text-text-secondary">Trace is searching your meetings...</p>
            ) : queryResult ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      queryResult.confidence === "high"
                        ? "green"
                        : queryResult.confidence === "medium"
                          ? "orange"
                          : "gray"
                    }
                  >
                    {queryResult.confidence} confidence
                  </Badge>
                  <button
                    type="button"
                    onClick={() => setQueryResult(null)}
                    className="text-xs font-semibold text-text-muted"
                  >
                    Close
                  </button>
                </div>
                <p className="text-sm leading-relaxed text-text-primary">{queryResult.answer}</p>
                <Link to="/ask" className="inline-flex items-center text-sm font-semibold text-primary">
                  Full search <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageShell>
  )
}

function StatCard({
  title,
  value,
  subtext,
  icon,
  iconClass,
}: {
  title: string
  value: number
  subtext: string
  icon: ReactNode
  iconClass: string
}) {
  return (
    <Card className="space-y-3">
      <span className={`inline-flex rounded-full p-3 ${iconClass}`}>{icon}</span>
      <div className="text-3xl font-bold text-text-primary">
        <AnimatedCounter value={value} />
      </div>
      <h3 className="text-sm font-semibold text-text-secondary">{title}</h3>
      <p className="text-xs text-text-muted">{subtext}</p>
    </Card>
  )
}

function AnimatedCounter({ value }: { value: number }) {
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (latest) => Math.round(latest))

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 1.5, ease: "easeOut" })
    return () => controls.stop()
  }, [motionValue, value])

  return <motion.span>{rounded}</motion.span>
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-36 w-full rounded-lg" />
      ))}
    </div>
  )
}

function UploadCard({
  uploadState,
  isDragOver,
  fileInputId,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onProcessUpload,
  onReset,
}: {
  uploadState: UploadState | null
  isDragOver: boolean
  fileInputId: string
  onDragOver: (event: DragEvent<HTMLDivElement>) => void
  onDragLeave: () => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
  onFileChange: (file: File | null) => void
  onProcessUpload: () => void
  onReset: () => void
}) {
  const isProcessing = Boolean(uploadState?.jobId)

  return (
    <Card
      className={`rounded-xl border-2 border-dashed p-10 text-center transition-all ${
        isDragOver ? "border-primary bg-primary-light" : "border-primary-border bg-white hover:bg-[#f8f8ff]"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        id={fileInputId}
        type="file"
        className="hidden"
        accept=".mp3,.mp4,.wav,.m4a,.ogg,.flac"
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
      />
      {!uploadState ? (
        <>
          <UploadCloud className={`mx-auto h-12 w-12 ${isDragOver ? "scale-110 text-primary" : "text-primary"}`} />
          <h3 className="mt-4 text-xl font-semibold text-text-primary">Upload a meeting recording</h3>
          <p className="mt-2 text-text-secondary">Drop your audio or video file here</p>
          <p className="mt-1 text-sm text-text-muted">MP3, MP4, WAV, M4A, OGG, FLAC</p>
          <label htmlFor={fileInputId} className="mt-4 inline-block cursor-pointer text-sm font-semibold text-primary">
            or click to browse
          </label>
        </>
      ) : isProcessing ? (
        <ProcessingTracker status={uploadState.status} progress={uploadState.progress} />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">{uploadState.file.name}</span> ·{" "}
            {(uploadState.file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
          <Button fullWidth onClick={onProcessUpload}>
            Process with Trace →
          </Button>
          <button type="button" onClick={onReset} className="text-sm text-text-muted">
            Remove file
          </button>
        </div>
      )}
    </Card>
  )
}

function ProcessingTracker({ status, progress }: { status: UploadState["status"]; progress: number }) {
  const stepIndex = progress < 25 ? 0 : progress < 60 ? 1 : progress < 85 ? 2 : progress < 100 ? 3 : 4
  const steps = [
    { title: "Converting audio", description: "Preparing your recording..." },
    { title: "Transcribing speech", description: "Identifying all speakers..." },
    { title: "Extracting insights", description: "Finding tasks, decisions, blockers..." },
    { title: "Building search index", description: "Making it searchable..." },
  ]

  return (
    <div className="space-y-4 text-left">
      {steps.map((step, index) => {
        const completed = stepIndex > index || status === "completed"
        const active = stepIndex === index && status !== "completed"
        return (
          <div key={step.title} className="flex items-start gap-3">
            <span
              className={`mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border ${
                completed
                  ? "border-[var(--success)] bg-[var(--success)] text-white"
                  : active
                    ? "animate-spin border-primary border-t-transparent text-primary"
                    : "border-border-medium text-text-muted"
              }`}
            >
              {completed ? "✓" : ""}
            </span>
            <div>
              <p
                className={`font-medium ${
                  completed ? "text-[var(--success)]" : active ? "text-primary" : "text-text-muted"
                }`}
              >
                {step.title}
              </p>
              {active ? <p className="text-sm italic text-text-secondary">{step.description}</p> : null}
            </div>
          </div>
        )
      })}
      <div className="mt-5">
        <div className="h-2 w-full rounded-full bg-bg-elevated">
          <motion.div
            className="h-2 rounded-full bg-primary"
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
        <p className="mt-2 text-sm text-text-secondary">{progress}% complete</p>
      </div>
    </div>
  )
}
