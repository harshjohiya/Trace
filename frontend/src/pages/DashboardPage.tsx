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

type UploadStatus = JobStatus["status"] | "idle" | "uploading"

interface UploadState {
  file: File
  jobId: string | null
  progress: number
  status: UploadStatus
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
    if (!jobId) return
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
        if (pollTimer.current) window.clearInterval(pollTimer.current)
        toast.error((apiError as ApiClientError).message)
        setUploadState(null)
      }
    }, 6000)
  }

  const handleProcessUpload = async () => {
    if (!uploadState?.file) return
    const file = uploadState.file
    try {
      setUploadState((prev) =>
        prev
          ? {
              ...prev,
              status: "uploading",
              progress: 0,
            }
          : prev,
      )
      const response = await uploadMeeting(file, (progress) => {
        setUploadState((prev) =>
          prev
            ? {
                ...prev,
                status: "uploading",
                progress,
              }
            : prev,
        )
      })
      if (response.status === "duplicate") {
        if (pollTimer.current) window.clearInterval(pollTimer.current)
        toast(response.message)
        setUploadState(null)
        void fetchMeetings()
        return
      }
      if (!response.job_id) {
        if (pollTimer.current) window.clearInterval(pollTimer.current)
        toast.error("Upload response did not include a job id.")
        setUploadState(null)
        return
      }
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
      setUploadState((prev) =>
        prev
          ? {
              ...prev,
              status: "idle",
            }
          : prev,
      )
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
    <PageShell className="space-y-8 pb-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-purple-500/5 to-transparent -z-10 pointer-events-none" />
      <div className="fixed -left-40 top-40 h-96 w-96 rounded-full bg-primary/10 mix-blend-multiply blur-[100px] animate-blob -z-10 pointer-events-none" />
      <div className="fixed right-0 bottom-0 h-96 w-96 rounded-full bg-pink-500/10 mix-blend-multiply blur-[100px] animate-blob animation-delay-2000 -z-10 pointer-events-none" />
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
    <Card className="group relative overflow-hidden p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 border-white/60 bg-white/60 shadow-glass backdrop-blur-xl">
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br from-primary/15 to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-gradient-to-tr from-purple-500/10 to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative z-10 space-y-4">
        <span className={`inline-flex rounded-xl p-3 shadow-sm transition-transform duration-300 group-hover:scale-110 bg-gradient-to-br border border-white/50 ${iconClass}`}>{icon}</span>
        <div className="text-4xl font-extrabold tracking-tight text-text-primary">
          <AnimatedCounter value={value} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-text-secondary">{title}</h3>
          <p className="text-xs font-medium text-text-muted mt-1">{subtext}</p>
        </div>
      </div>
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
        <Skeleton key={index} className="h-40 w-full rounded-2xl" />
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
  const isProcessing = Boolean(uploadState?.jobId) || uploadState?.status === "uploading"

  return (
    <Card
      className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
        isDragOver ? "border-primary bg-primary/5 scale-[1.02] shadow-primary" : "border-border-medium bg-white hover:border-primary/50 hover:bg-bg-surface hover:shadow-md"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
      <input
        id={fileInputId}
        type="file"
        className="hidden"
        accept=".mp3,.mp4,.wav,.m4a,.ogg,.flac"
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
      />
      <div className="relative z-10">
        {!uploadState ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
            <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-transform duration-300 ${isDragOver ? "scale-110" : "group-hover:scale-110"}`}>
              <UploadCloud className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-text-primary">Upload a meeting recording</h3>
            <p className="mt-2 text-text-secondary">Drop your audio or video file here</p>
            <p className="mt-1 text-sm text-text-muted font-medium">MP3, MP4, WAV, M4A, OGG, FLAC</p>
            <label htmlFor={fileInputId} className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-primary shadow-sm ring-1 ring-inset ring-primary/20 hover:bg-primary/5 transition-all hover:scale-105 active:scale-95">
              Browse files
            </label>
          </motion.div>
        ) : isProcessing ? (
          <ProcessingTracker status={uploadState.status} progress={uploadState.progress} />
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 mx-auto max-w-sm">
            <div className="rounded-xl border border-border-light bg-white p-4 shadow-sm flex items-center justify-between">
              <div className="text-left overflow-hidden">
                <p className="truncate font-semibold text-text-primary">{uploadState.file.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{(uploadState.file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <button type="button" onClick={onReset} className="ml-4 rounded-full p-1.5 text-text-muted hover:bg-bg-surface hover:text-[var(--danger)] transition-colors">
                ✕
              </button>
            </div>
            <Button size="lg" fullWidth className="h-12 shadow-md hover:shadow-lg rounded-xl" onClick={onProcessUpload}>
              <Sparkles className="mr-2 h-4 w-4" />
              Process with Trace
            </Button>
          </motion.div>
        )}
      </div>
    </Card>
  )
}

function ProcessingTracker({ status, progress }: { status: UploadStatus; progress: number }) {
  if (status === "uploading") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 text-left mx-auto max-w-md bg-white p-6 rounded-xl shadow-sm border border-border-light">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <UploadCloud className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div>
            <p className="font-bold text-text-primary text-lg">Uploading file</p>
            <p className="text-sm font-medium text-text-secondary mt-1">Sending your recording to Trace...</p>
          </div>
        </div>
        <div className="mt-5">
          <div className="h-2.5 w-full rounded-full bg-bg-elevated overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500"
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm font-bold text-primary">{progress}%</p>
            <p className="text-xs font-medium text-text-muted">Please keep this window open</p>
          </div>
        </div>
      </motion.div>
    )
  }

  const stepIndex = progress < 25 ? 0 : progress < 60 ? 1 : progress < 85 ? 2 : progress < 100 ? 3 : 4
  const steps = [
    { title: "Converting audio", description: "Preparing your recording..." },
    { title: "Transcribing speech", description: "Identifying all speakers..." },
    { title: "Extracting insights", description: "Finding tasks, decisions, blockers..." },
    { title: "Building search index", description: "Making it searchable..." },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left mx-auto max-w-md bg-white p-6 rounded-xl shadow-sm border border-border-light relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-pulse" />
      <div className="space-y-5">
        {steps.map((step, index) => {
          const completed = stepIndex > index || status === "completed"
          const active = stepIndex === index && status !== "completed"
          return (
            <div key={step.title} className={`flex items-start gap-4 transition-opacity duration-300 ${!completed && !active ? "opacity-40" : "opacity-100"}`}>
              <span
                className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                  completed
                    ? "border-[var(--success)] bg-[var(--success)] text-white shadow-sm"
                    : active
                      ? "animate-spin border-primary border-t-transparent text-primary"
                      : "border-border-medium text-text-muted bg-bg-surface"
                }`}
              >
                {completed ? "✓" : ""}
              </span>
              <div>
                <p
                  className={`font-bold ${
                    completed ? "text-text-primary" : active ? "text-primary" : "text-text-muted"
                  }`}
                >
                  {step.title}
                </p>
                {active ? <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium text-text-secondary mt-1">{step.description}</motion.p> : null}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-6 pt-6 border-t border-border-light">
        <div className="h-2 w-full rounded-full bg-bg-elevated overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500"
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
        <p className="mt-2 text-right text-sm font-bold text-primary">{progress}% complete</p>
      </div>
    </motion.div>
  )
}
