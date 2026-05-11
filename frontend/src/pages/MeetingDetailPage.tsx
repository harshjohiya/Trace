import { motion } from "framer-motion"
import {
  AlertTriangle,
  ArrowLeft,
  Clipboard,
  Code2,
  Copy,
  ListChecks,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react"
import { type ReactNode, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { Link, useNavigate, useParams } from "react-router-dom"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { PageShell } from "@/components/shared/page-shell"
import { Skeleton } from "@/components/shared/skeleton"
import { SpeakerAvatar } from "@/components/shared/speaker-avatar"
import { TypeBadge } from "@/components/shared/type-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs } from "@/components/ui/tabs"
import { deleteMeeting, getMeeting, getMeetingTranscript } from "@/api"
import {
  formatDate,
  formatDuration,
  formatTimestamp,
  isDueToday,
  isDueTomorrow,
  nameToColorIndex,
} from "@/lib/utils"
import type { ApiClientError, MeetingExtraction, MeetingTranscript, TranscriptSegment } from "@/types"

type MeetingTab = "summary" | "transcript" | "actions" | "export"

const tabItems: { key: MeetingTab; label: string }[] = [
  { key: "summary", label: "Summary" },
  { key: "transcript", label: "Transcript" },
  { key: "actions", label: "Action Items" },
  { key: "export", label: "Export" },
]

export function MeetingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState<MeetingTab>("summary")
  const [extraction, setExtraction] = useState<MeetingExtraction | null>(null)
  const [transcript, setTranscript] = useState<MeetingTranscript | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [ownerFilter, setOwnerFilter] = useState("all")
  const [showJson, setShowJson] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  async function fetchData() {
    if (!id) return
    setIsLoading(true)
    setError(undefined)
    try {
      const [meetingData, transcriptData] = await Promise.all([getMeeting(id), getMeetingTranscript(id)])
      setExtraction(meetingData)
      setTranscript(transcriptData)
    } catch (apiError) {
      setError((apiError as ApiClientError).message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchData()
  }, [id])

  const owners = useMemo(() => {
    if (!extraction) return []
    return Array.from(new Set(extraction.action_items.map((item) => item.owner)))
  }, [extraction])

  const filteredActionItems = useMemo(() => {
    if (!extraction) return []
    if (ownerFilter === "all") return extraction.action_items
    return extraction.action_items.filter((item) => item.owner === ownerFilter)
  }, [extraction, ownerFilter])

  const groupedTranscript = useMemo(() => {
    if (!transcript) return []
    const groups: { speaker: string; start: number; segments: TranscriptSegment[] }[] = []
    transcript.segments.forEach((segment) => {
      const lastGroup = groups[groups.length - 1]
      if (lastGroup && lastGroup.speaker === segment.speaker) {
        lastGroup.segments.push(segment)
      } else {
        groups.push({ speaker: segment.speaker, start: segment.start, segments: [segment] })
      }
    })
    return groups
  }, [transcript])

  const summaryTotal =
    (extraction?.action_items.length ?? 0) +
    (extraction?.decisions.length ?? 0) +
    (extraction?.blockers.length ?? 0)

  const chartData = [
    { name: "Tasks", value: extraction?.action_items.length ?? 0, color: "#22c55e" },
    { name: "Decisions", value: extraction?.decisions.length ?? 0, color: "#3b82f6" },
    { name: "Blockers", value: extraction?.blockers.length ?? 0, color: "#ef4444" },
  ]

  const onCopySummary = async () => {
    if (!extraction) return
    await navigator.clipboard.writeText(extraction.summary)
    toast.success("Copied!")
  }

  const onCopyTasks = async () => {
    if (!extraction) return
    const markdown = [
      `## ${extraction.title} — Action Items`,
      `Date: ${formatDate(extraction.created_at)}`,
      "",
      ...extraction.action_items.map(
        (item) => `- [ ] ${item.task} — ${item.owner} | Due: ${item.deadline ?? "No deadline"}`,
      ),
    ].join("\n")
    await navigator.clipboard.writeText(markdown)
    toast.success("Copied!")
  }

  const onDeleteMeeting = async () => {
    if (!id) return
    try {
      await deleteMeeting(id)
      toast.success("Meeting deleted")
      navigate("/meetings", { replace: true })
    } catch (apiError) {
      toast.error((apiError as ApiClientError).message)
    }
  }

  if (isLoading) {
    return (
      <PageShell className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </PageShell>
    )
  }

  if (error) {
    return (
      <PageShell>
        <ErrorState message={error} onRetry={() => void fetchData()} />
      </PageShell>
    )
  }

  if (!extraction || !transcript) {
    return (
      <PageShell>
        <EmptyState title="Meeting not found" message="This meeting does not exist or was removed." />
      </PageShell>
    )
  }

  return (
    <PageShell className="space-y-6">
      <div className="space-y-4">
        <Link to="/meetings" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to Meetings
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">{extraction.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <TypeBadge type={extraction.meeting_type} />
            <span>{formatDate(extraction.created_at)}</span>
            <span>·</span>
            <span>{formatDuration(extraction.duration_sec)}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {extraction.speakers.map((speaker) => (
              <Badge key={speaker} variant="gray" className="inline-flex items-center gap-2">
                <SpeakerAvatar name={speaker} size="sm" />
                {speaker}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Tabs tabs={tabItems} value={tab} onChange={setTab} />

      {tab === "summary" ? (
        <section className="grid gap-4 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <Card className="border-l-4 border-l-primary">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-text-primary">Meeting Summary</h3>
              </div>
              <p className="mt-4 leading-relaxed text-text-secondary">
                {extraction.summary || "No summary available for this meeting."}
              </p>
            </Card>

            <Card>
              <h3 className="font-semibold text-text-primary">Topics Covered</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {extraction.key_topics.length === 0 ? (
                  <p className="text-sm italic text-text-muted">No key topics extracted.</p>
                ) : (
                  extraction.key_topics.map((topic) => (
                    <Badge key={topic} variant="indigo">
                      {topic}
                    </Badge>
                  ))
                )}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text-primary">Action Items</h3>
                <Badge variant="green">{extraction.action_items.length}</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {extraction.action_items.length === 0 ? (
                  <p className="text-sm text-text-muted">No action items identified.</p>
                ) : (
                  extraction.action_items.map((item, index) => {
                    const dueLabel = item.deadline
                      ? isDueToday(item.deadline)
                        ? { text: "Due today", variant: "red" as const }
                        : isDueTomorrow(item.deadline)
                          ? { text: "Due tomorrow", variant: "orange" as const }
                          : { text: item.deadline, variant: "gray" as const }
                      : null
                    return (
                      <motion.div
                        key={`${item.task}-${index}`}
                        whileHover={{ y: -2 }}
                        className="rounded-md border border-border-light p-4 transition-colors hover:border-primary"
                      >
                        <p className="font-medium text-text-primary">{item.task}</p>
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                          <div className="inline-flex items-center gap-2">
                            <SpeakerAvatar name={item.owner} size="sm" />
                            <Badge variant="gray">{item.owner}</Badge>
                          </div>
                          {dueLabel ? <Badge variant={dueLabel.variant}>{dueLabel.text}</Badge> : null}
                        </div>
                        <p className="mt-2 text-xs text-text-muted">Assigned by {item.mentioned_by}</p>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text-primary">Decisions</h3>
                <Badge variant="blue">{extraction.decisions.length}</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {extraction.decisions.length === 0 ? (
                  <p className="text-sm text-text-muted">No decisions captured.</p>
                ) : (
                  extraction.decisions.map((decision, index) => (
                    <div
                      key={`${decision.decision}-${index}`}
                      className="relative rounded-md border-l-4 border-l-[var(--info)] bg-[var(--info-light)]/40 p-4"
                    >
                      <Zap className="absolute right-3 top-3 h-4 w-4 text-[var(--info)]" />
                      <p className="font-medium text-text-primary">{decision.decision}</p>
                      <p className="mt-1 text-sm text-text-muted">— {decision.made_by}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-text-primary">Blockers</h3>
              <div className="mt-4 space-y-3">
                {extraction.blockers.length === 0 ? (
                  <div className="rounded-md border border-[var(--success-border)] bg-[var(--success-light)] p-4 text-[var(--success)]">
                    ✓ No blockers identified
                  </div>
                ) : (
                  extraction.blockers.map((blocker, index) => (
                    <div
                      key={`${blocker.blocker}-${index}`}
                      className="rounded-md border border-[var(--danger-border)] border-l-4 border-l-[var(--danger)] bg-[var(--danger-light)] p-4"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 text-[var(--danger)]" />
                        <div>
                          <p className="text-sm font-medium text-[#7f1d1d]">{blocker.blocker}</p>
                          <p className="mt-1 text-xs text-text-muted">Affects: {blocker.affects}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-text-primary">At a Glance</h3>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" innerRadius={60} outerRadius={85}>
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="-mt-8 text-center text-3xl font-bold text-text-primary">{summaryTotal}</p>
              <p className="text-center text-sm text-text-muted">Total insights</p>
              <div className="mt-4 space-y-2 text-sm">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-text-primary">Participants</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {extraction.speakers.map((speaker) => (
                  <div key={speaker} className="inline-flex items-center gap-2 rounded-full bg-bg-surface px-3 py-2">
                    <SpeakerAvatar name={speaker} />
                    <span className="text-sm text-text-secondary">{speaker}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      ) : null}

      {tab === "transcript" ? (
        <Card className="space-y-5">
          <p className="text-sm text-text-muted">{transcript.segments.length} segments</p>
          {groupedTranscript.length === 0 ? (
            <EmptyState title="Transcript empty" message="No transcript segments found for this meeting." />
          ) : (
            groupedTranscript.map((group, groupIndex) => {
              const colorPalette = [
                "text-[#6366f1]",
                "text-[#0d9488]",
                "text-[#ea580c]",
                "text-[#9333ea]",
                "text-[#16a34a]",
                "text-[#db2777]",
                "text-[#d97706]",
                "text-[#0891b2]",
              ]
              const nameColor = colorPalette[nameToColorIndex(group.speaker, colorPalette.length)]
              return (
                <div key={`${group.speaker}-${group.start}-${groupIndex}`} className="border-b border-bg-elevated py-3">
                  <div className="mb-2 flex items-center gap-2">
                    <SpeakerAvatar name={group.speaker} />
                    <p className={`font-semibold ${nameColor}`}>{group.speaker}</p>
                    <Badge variant="gray">{formatTimestamp(group.start)}</Badge>
                  </div>
                  <div className="space-y-2 pl-12">
                    {group.segments.map((segment, segmentIndex) => (
                      <div key={`${segment.text}-${segment.start}-${segmentIndex}`} className="text-sm text-text-secondary">
                        <p>{segment.text}</p>
                        <p className="mt-1 text-xs text-text-muted">{formatTimestamp(segment.start)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </Card>
      ) : null}

      {tab === "actions" ? (
        <Card>
          <div className="mb-4 flex flex-wrap gap-2">
            <FilterChip
              label="All"
              active={ownerFilter === "all"}
              onClick={() => {
                setOwnerFilter("all")
              }}
            />
            {owners.map((owner) => (
              <FilterChip
                key={owner}
                label={owner}
                active={ownerFilter === owner}
                onClick={() => {
                  setOwnerFilter(owner)
                }}
              />
            ))}
          </div>
          {filteredActionItems.length === 0 ? (
            <EmptyState title="No action items identified" message="Try viewing another meeting or owner filter." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-border-light text-text-secondary">
                    <th className="px-4 py-3 font-semibold">Task</th>
                    <th className="px-4 py-3 font-semibold">Owner</th>
                    <th className="px-4 py-3 font-semibold">Deadline</th>
                    <th className="px-4 py-3 font-semibold">Assigned By</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActionItems.map((item, index) => (
                    <tr key={`${item.task}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}>
                      <td className="px-4 py-4 font-medium text-text-primary">{item.task}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-bg-surface px-3 py-1">
                          <SpeakerAvatar name={item.owner} size="sm" />
                          {item.owner}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {item.deadline ? (
                          <Badge
                            variant={
                              isDueToday(item.deadline)
                                ? "red"
                                : isDueTomorrow(item.deadline)
                                  ? "orange"
                                  : "gray"
                            }
                          >
                            {isDueToday(item.deadline)
                              ? "Due today"
                              : isDueTomorrow(item.deadline)
                                ? "Due tomorrow"
                                : item.deadline}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-4 text-text-muted">{item.mentioned_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : null}

      {tab === "export" ? (
        <section className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-3">
            <ExportActionCard
              icon={<Clipboard className="h-5 w-5 text-primary" />}
              title="Copy meeting summary"
              body="Paste directly into Slack, email, or docs"
              buttonLabel="Copy to clipboard"
              onClick={() => {
                void onCopySummary()
              }}
              buttonVariant="secondary"
            />
            <ExportActionCard
              icon={<ListChecks className="h-5 w-5 text-[var(--success)]" />}
              title="Copy action items"
              body="Formatted as a markdown checklist"
              buttonLabel="Copy as markdown"
              onClick={() => {
                void onCopyTasks()
              }}
              buttonVariant="secondary"
            />
            <ExportActionCard
              icon={<Code2 className="h-5 w-5 text-text-secondary" />}
              title="Export raw data"
              body="Complete extraction as JSON"
              buttonLabel="View JSON"
              onClick={() => setShowJson((value) => !value)}
              buttonVariant="secondary"
            />
          </div>

          <motion.div
            initial={false}
            animate={{ height: showJson ? "auto" : 0, opacity: showJson ? 1 : 0 }}
            className="overflow-hidden"
          >
            <Card className="space-y-3">
              <div className="flex justify-between">
                <h3 className="font-semibold text-text-primary">JSON</h3>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    void navigator.clipboard.writeText(JSON.stringify(extraction, null, 2))
                    toast.success("Copied!")
                  }}
                >
                  <Copy className="mr-1 h-4 w-4" />
                  Copy
                </Button>
              </div>
              <pre className="overflow-x-auto rounded-md bg-bg-surface p-4 font-mono text-xs">
                {JSON.stringify(extraction, null, 2)}
              </pre>
            </Card>
          </motion.div>

          <div className="space-y-3 border-t border-border-light pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--danger)]">Danger Zone</p>
            <Card className="border-[var(--danger-border)]">
              <h3 className="font-semibold text-text-primary">Delete this meeting</h3>
              <p className="mt-2 text-sm text-text-secondary">
                This will permanently remove the meeting, transcript, and all extracted data.
              </p>
              <Button variant="danger" className="mt-4" onClick={() => setShowDeleteModal(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete meeting
              </Button>
            </Card>
          </div>
        </section>
      ) : null}

      {showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg rounded-xl bg-white p-8 shadow-xl"
          >
            <h3 className="text-2xl font-bold text-text-primary">Delete meeting?</h3>
            <p className="mt-2 text-text-secondary">
              This action cannot be undone. Trace will remove transcript and extracted insights permanently.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => void onDeleteMeeting()}>
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </PageShell>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm ${
        active ? "border-primary bg-primary text-white" : "border-border-medium bg-white text-text-secondary"
      }`}
    >
      {label}
    </button>
  )
}

function ExportActionCard({
  icon,
  title,
  body,
  buttonLabel,
  onClick,
  buttonVariant,
}: {
  icon: ReactNode
  title: string
  body: string
  buttonLabel: string
  onClick: () => void
  buttonVariant: "primary" | "secondary" | "ghost" | "danger"
}) {
  return (
    <Card className="space-y-3">
      <span className="inline-flex rounded-full bg-bg-surface p-3">{icon}</span>
      <h3 className="font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary">{body}</p>
      <Button variant={buttonVariant} onClick={onClick}>
        {buttonLabel}
      </Button>
    </Card>
  )
}
