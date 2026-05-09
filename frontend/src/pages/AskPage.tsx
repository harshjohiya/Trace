import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Send, Sparkles } from "lucide-react"
import { KeyboardEvent, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { PageShell } from "@/components/shared/page-shell"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { queryMeetings } from "@/lib/api"
import type {
  ApiClientError,
  FilteredQueryResponse,
  QueryConfidence,
  QueryFilterType,
  QueryResponse,
  SearchResult,
} from "@/types"

type FilterPill = "all" | QueryFilterType

interface Exchange {
  id: string
  question: string
  answer?: QueryResponse
  structured?: FilteredQueryResponse
}

const suggestions = [
  "What are all open tasks?",
  "What decisions need follow-up?",
  "Who has the most action items?",
  "What blockers are unresolved?",
  "Summarize recent meetings",
  "What came up most across meetings?",
]

export function AskPage() {
  const [question, setQuestion] = useState("")
  const [filter, setFilter] = useState<FilterPill>("all")
  const [history, setHistory] = useState<string[]>([])
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [typingById, setTypingById] = useState<Record<string, string>>({})
  const [sourcesOpen, setSourcesOpen] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (exchanges.length === 0) return
    const latest = exchanges[exchanges.length - 1]
    if (!latest.answer) return

    const text = latest.answer.answer
    let index = 0
    setTypingById((prev) => ({ ...prev, [latest.id]: "" }))
    const timer = window.setInterval(() => {
      index += 1
      setTypingById((prev) => ({ ...prev, [latest.id]: text.slice(0, index) }))
      if (index >= text.length) {
        window.clearInterval(timer)
      }
    }, 15)
    return () => window.clearInterval(timer)
  }, [exchanges])

  const emptyExamples = useMemo(
    () => [
      "What are all open action items?",
      "What decisions were made?",
      "What blockers are affecting the team?",
      "Who said what about roadmap?",
    ],
    [],
  )

  const runQuery = async (text: string) => {
    if (!text.trim()) return
    setError(undefined)
    setIsLoading(true)
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const trimmed = text.trim()
    setQuestion("")

    setHistory((prev) => [trimmed, ...prev.filter((entry) => entry !== trimmed)].slice(0, 10))
    setExchanges((prev) => [...prev, { id, question: trimmed }])

    try {
      const response = await queryMeetings({
        question: trimmed,
        filter_type: filter === "all" ? undefined : filter,
      })
      setExchanges((prev) =>
        prev.map((exchange) =>
          exchange.id === id
            ? "answer" in response
              ? { ...exchange, answer: response }
              : { ...exchange, structured: response }
            : exchange,
        ),
      )
    } catch (apiError) {
      setError((apiError as ApiClientError).message)
      toast.error((apiError as ApiClientError).message)
    } finally {
      setIsLoading(false)
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void runQuery(question)
    }
  }

  return (
    <PageShell className="grid min-h-[calc(100vh-160px)] gap-4 md:grid-cols-[260px_1fr]">
      <aside className="rounded-lg border border-border-light bg-white p-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.06em] text-text-muted">Ask History</h2>
        <div className="mt-4 max-h-48 space-y-2 overflow-auto">
          {history.length === 0 ? (
            <p className="text-sm italic text-text-muted">No questions yet</p>
          ) : (
            history.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => void runQuery(item)}
                className="w-full rounded-full border border-border-light px-3 py-2 text-left text-sm text-text-secondary hover:border-primary hover:bg-primary-light hover:text-primary"
              >
                {item}
              </button>
            ))
          )}
        </div>
        <div className="my-5 h-px bg-border-light" />
        <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-text-muted">Try asking</h3>
        <div className="mt-3 space-y-2">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => void runQuery(item)}
              className="w-full rounded-full border border-border-light px-3 py-2 text-left text-sm text-text-secondary hover:border-primary hover:bg-primary-light hover:text-primary"
            >
              {item}
            </button>
          ))}
        </div>
      </aside>

      <section className="relative flex min-h-[680px] flex-col rounded-lg border border-border-light bg-white">
        <div className="flex-1 space-y-6 overflow-y-auto p-6 pb-32">
          {error ? <ErrorState message={error} /> : null}
          {exchanges.length === 0 ? (
            <div className="flex min-h-[500px] flex-col items-center justify-center text-center relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-bg-surface border border-border-light">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 to-transparent opacity-50" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="relative z-10 flex flex-col items-center">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 shadow-glass mb-6">
                  <div className="absolute inset-0 rounded-3xl border border-primary/20 bg-white/40 backdrop-blur-sm" />
                  <Sparkles className="relative z-10 h-10 w-10 text-primary animate-pulse" />
                </div>
                <h2 className="text-4xl font-extrabold tracking-tight text-text-primary bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary">
                  Ask anything about your meetings
                </h2>
                <p className="mt-4 max-w-xl text-lg text-text-secondary font-medium">
                  Trace searches across everything you&apos;ve uploaded and answers in plain English.
                </p>
                <div className="mt-10 grid w-full max-w-3xl gap-4 sm:grid-cols-2">
                  {emptyExamples.map((item, index) => (
                    <motion.button
                      key={item}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      type="button"
                      onClick={() => {
                        setQuestion(item)
                        void runQuery(item)
                      }}
                      className="group flex items-center justify-between rounded-xl border border-border-light bg-white p-5 text-left text-sm font-semibold text-text-secondary shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                    >
                      <span>{item}</span>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100">
                        <Send className="h-3 w-3 text-primary" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            exchanges.map((exchange) => (
              <motion.div 
                key={exchange.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="ml-auto max-w-[75%] rounded-[20px_20px_4px_20px] bg-primary px-5 py-3.5 text-[15px] font-medium text-white shadow-sm">
                  {exchange.question}
                </div>
                <div className="max-w-[90%] rounded-[4px_20px_20px_20px] border border-border-light bg-white p-6 shadow-sm ring-1 ring-black/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-purple-500" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-bold text-text-primary">Trace AI</span>
                    </div>
                    {exchange.answer ? (
                      <Badge variant={confidenceToBadge(exchange.answer.confidence)} className="shadow-sm">
                        {confidenceToLabel(exchange.answer.confidence)}
                      </Badge>
                    ) : exchange.structured ? (
                      <Badge variant="gray" className="shadow-sm">Filtered results</Badge>
                    ) : (
                      <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse animation-delay-200" />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse animation-delay-400" />
                      </div>
                    )}
                  </div>

                  {exchange.answer ? (
                    <p className="mt-4 whitespace-pre-line leading-relaxed text-text-primary">
                      {typingById[exchange.id] ?? ""}
                    </p>
                  ) : null}

                  {exchange.structured ? (
                    <div className="mt-4 space-y-3">
                      {exchange.structured.results.length === 0 ? (
                        <EmptyState title="No matching results" message="Try changing filters or wording." />
                      ) : (
                        exchange.structured.results.map((item, index) => (
                          <StructuredResultCard
                            key={`${exchange.id}-${index}`}
                            filterType={exchange.structured?.filter_type ?? "action_item"}
                            result={item}
                          />
                        ))
                      )}
                    </div>
                  ) : null}

                  {exchange.answer && exchange.answer.sources.length > 0 ? (
                    <div className="mt-4 border-t border-border-light pt-3">
                      <button
                        type="button"
                        className="flex items-center gap-2 text-sm font-medium text-text-secondary"
                        onClick={() =>
                          setSourcesOpen((prev) => ({ ...prev, [exchange.id]: !prev[exchange.id] }))
                        }
                      >
                        {exchange.answer.sources.length} sources
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            sourcesOpen[exchange.id] ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {sourcesOpen[exchange.id] ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 flex flex-wrap gap-2 overflow-hidden"
                          >
                            {exchange.answer.sources.map((source, index) => (
                              <Badge key={`${source.meeting_id}-${index}`} variant="gray">
                                {source.meeting_id} · {source.type} · {source.score.toFixed(2)}
                              </Badge>
                            ))}
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ))
          )}

          {isLoading ? (
            <div className="w-fit rounded-lg border border-border-light bg-white px-4 py-3 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map((item) => (
                    <motion.span
                      key={item}
                      className="h-2 w-2 rounded-full bg-primary"
                      animate={{ scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, delay: item * 0.15 }}
                    />
                  ))}
                </span>
                Trace is searching your meetings...
              </div>
            </div>
          ) : null}
        </div>

        <div className="absolute inset-x-0 bottom-0 border-t border-border-light bg-white p-5">
          <div className="relative">
            <Sparkles className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-primary" />
            <Textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={onKeyDown}
              rows={3}
              placeholder="Ask anything about your meetings..."
              className="pl-10 pr-12"
            />
            <button
              type="button"
              onClick={() => {
                void runQuery(question)
              }}
              className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-text-muted">Filter:</span>
            <FilterButton
              label="All"
              active={filter === "all"}
              onClick={() => {
                setFilter("all")
              }}
            />
            <FilterButton
              label="Action Items"
              active={filter === "action_item"}
              onClick={() => {
                setFilter("action_item")
              }}
            />
            <FilterButton
              label="Decisions"
              active={filter === "decision"}
              onClick={() => {
                setFilter("decision")
              }}
            />
            <FilterButton
              label="Blockers"
              active={filter === "blocker"}
              onClick={() => {
                setFilter("blocker")
              }}
            />
          </div>
        </div>
      </section>
    </PageShell>
  )
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        active ? "border-primary bg-primary text-white" : "border-border-medium bg-white text-text-secondary"
      }`}
    >
      {label}
    </button>
  )
}

function confidenceToBadge(confidence: QueryConfidence): "green" | "orange" | "gray" {
  if (confidence === "high") return "green"
  if (confidence === "medium") return "orange"
  return "gray"
}

function confidenceToLabel(confidence: QueryConfidence): string {
  if (confidence === "high") return "High confidence"
  if (confidence === "medium") return "Check sources"
  return "Limited context"
}

function StructuredResultCard({
  filterType,
  result,
}: {
  filterType: QueryFilterType
  result: SearchResult
}) {
  if (filterType === "action_item") {
    return (
      <div className="group relative overflow-hidden rounded-xl border border-[var(--success-border)] bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="absolute left-0 top-0 h-full w-1.5 bg-[var(--success)]" />
        <div className="pl-2">
          <p className="font-bold text-text-primary text-[15px]">{result.task}</p>
          <div className="mt-2.5 flex items-center gap-3 text-xs font-medium text-text-secondary">
            <span className="flex items-center gap-1.5 rounded-full bg-bg-surface px-2.5 py-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />{result.owner}</span>
            <span className="text-text-muted">{result.deadline ?? "No deadline"}</span>
          </div>
        </div>
      </div>
    )
  }
  if (filterType === "decision") {
    return (
      <div className="group relative overflow-hidden rounded-xl border border-[var(--info-border)] bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="absolute left-0 top-0 h-full w-1.5 bg-[var(--info)]" />
        <div className="pl-2">
          <p className="font-bold text-text-primary text-[15px]">{result.decision}</p>
          <div className="mt-2.5 flex items-center gap-3 text-xs font-medium text-text-secondary">
            <span className="flex items-center gap-1.5 rounded-full bg-bg-surface px-2.5 py-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--info)]" />{result.made_by}</span>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="group relative overflow-hidden rounded-xl border border-[var(--danger-border)] bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="absolute left-0 top-0 h-full w-1.5 bg-[var(--danger)]" />
      <div className="pl-2">
        <p className="font-bold text-text-primary text-[15px]">{result.blocker}</p>
        <div className="mt-2.5 flex items-center gap-3 text-xs font-medium text-text-secondary">
          <span className="flex items-center gap-1.5 rounded-full bg-[var(--danger-light)] px-2.5 py-1 text-[#7f1d1d]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--danger)]" />Affects: {result.affects}</span>
        </div>
      </div>
    </div>
  )
}
