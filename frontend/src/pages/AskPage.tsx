import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Send, Sparkles } from "lucide-react"
import { KeyboardEvent, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { PageShell } from "@/components/shared/page-shell"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { queryMeetings } from "@/api"
import { useLocalStorage } from "@/hooks"
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
  const [history, setHistory] = useLocalStorage<string[]>("ask-page-history", [])
  const [exchanges, setExchanges] = useLocalStorage<Exchange[]>("ask-page-exchanges", [])
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
    <PageShell className="grid h-full gap-4 md:grid-cols-[260px_1fr] relative overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-purple-500/5 to-transparent -z-10 pointer-events-none" />
      <div className="fixed -left-40 top-40 h-96 w-96 rounded-full bg-primary/10 mix-blend-multiply blur-[100px] animate-blob -z-10 pointer-events-none" />
      
      <aside className="hidden md:flex flex-col rounded-2xl border border-border-light/50 bg-white/50 backdrop-blur-xl shadow-sm p-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white [&::-webkit-scrollbar-track]:bg-transparent">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-3 px-2">Recent</h2>
          <div className="space-y-0.5">
            {history.length === 0 ? (
              <p className="text-xs italic text-text-muted px-2">No history</p>
            ) : (
              history.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => void runQuery(item)}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg-surface transition-colors truncate"
                  title={item}
                >
                  {item}
                </button>
              ))
            )}
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-3 px-2">Try asking</h3>
          <div className="space-y-0.5">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => void runQuery(item)}
                className="w-full rounded-xl px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg-surface transition-colors truncate"
                title={item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className="relative flex flex-col rounded-2xl border border-border-light/50 bg-white/60 backdrop-blur-xl shadow-sm overflow-hidden h-full">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
        
        <div className="flex-1 space-y-8 overflow-y-auto p-4 md:p-8 pb-40 scroll-smooth flex flex-col [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-border-light/50 [&::-webkit-scrollbar-track]:bg-transparent">
          {error ? <ErrorState message={error} /> : null}
          
          {exchanges.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full mt-10 md:mt-20 px-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-center">
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                  Hello, how can I help?
                </h2>
                <p className="text-lg md:text-xl text-text-secondary font-medium">
                  Trace searches your meetings and answers in plain English.
                </p>
              </motion.div>

              <div className="mt-16 w-full grid grid-cols-1 md:grid-cols-2 gap-3">
                {emptyExamples.map((item, index) => (
                  <motion.button
                    key={item}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setQuestion(item)
                      void runQuery(item)
                    }}
                    className="group flex items-center justify-between rounded-2xl border border-border-light/80 bg-white/80 p-4 text-left text-sm font-medium text-text-secondary shadow-sm backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-white hover:shadow-md hover:text-text-primary"
                  >
                    <span>{item}</span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100">
                      <Send className="h-3 w-3 text-primary" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full space-y-8">
              {exchanges.map((exchange) => (
                <motion.div 
                  key={exchange.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-3xl rounded-tr-sm bg-bg-surface px-5 py-3.5 text-[15px] font-medium text-text-primary shadow-sm border border-border-light/50">
                      {exchange.question}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 max-w-[95%] md:max-w-[90%]">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-purple-500 shadow-sm text-white">
                        <Sparkles className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-text-primary">Trace</span>
                        {exchange.answer ? (
                          <Badge variant={confidenceToBadge(exchange.answer.confidence)} className="shadow-sm border-0 font-medium text-[10px] tracking-wider uppercase bg-bg-surface">
                            {confidenceToLabel(exchange.answer.confidence)}
                          </Badge>
                        ) : exchange.structured ? (
                          <Badge variant="gray" className="shadow-sm border-0 font-medium text-[10px] tracking-wider uppercase bg-bg-surface">Filtered results</Badge>
                        ) : (
                          <div className="flex items-center gap-1.5 rounded-full bg-bg-surface px-2.5 py-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse" />
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse animation-delay-200" />
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse animation-delay-400" />
                          </div>
                        )}
                      </div>

                      {exchange.answer ? (
                        <div className="prose prose-sm max-w-none text-text-primary leading-relaxed whitespace-pre-line">
                          {typingById[exchange.id] ?? ""}
                        </div>
                      ) : null}

                      {exchange.structured ? (
                        <div className="space-y-3">
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
                        <div className="pt-2">
                          <button
                            type="button"
                            className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-secondary transition-colors"
                            onClick={() =>
                              setSourcesOpen((prev) => ({ ...prev, [exchange.id]: !prev[exchange.id] }))
                            }
                          >
                            <ChevronDown
                              className={`h-3 w-3 transition-transform ${
                                sourcesOpen[exchange.id] ? "rotate-180" : ""
                              }`}
                            />
                            {exchange.answer.sources.length} sources
                          </button>
                          <AnimatePresence>
                            {sourcesOpen[exchange.id] ? (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 flex flex-wrap gap-1.5 overflow-hidden"
                              >
                                {exchange.answer.sources.map((source, index) => (
                                  <Badge key={`${source.meeting_id}-${index}`} variant="gray" className="text-[10px] font-medium bg-bg-surface border-border-light">
                                    {source.meeting_id} · {source.type} · {source.score.toFixed(2)}
                                  </Badge>
                                ))}
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="max-w-3xl mx-auto w-full">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-purple-500 shadow-sm text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary font-medium">
                  <span className="inline-flex gap-1">
                    {[0, 1, 2].map((item) => (
                      <motion.span
                        key={item}
                        className="h-1.5 w-1.5 rounded-full bg-primary/60"
                        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: item * 0.2 }}
                      />
                    ))}
                  </span>
                  Searching...
                </div>
              </div>
            </div>
          ) : null}
          
          <div className="h-32 md:h-40 flex-shrink-0 w-full" />
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-10 pb-6 px-4 md:px-6 z-10 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <div className="relative flex flex-col rounded-[24px] border border-border-medium bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <Textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Ask Trace anything..."
                className="w-full resize-none bg-transparent border-0 py-4 pl-5 pr-14 text-text-primary placeholder:text-text-muted focus-visible:ring-0 min-h-[56px] max-h-32 text-[15px]"
                style={{ height: "56px" }}
              />
              <button
                type="button"
                onClick={() => {
                  void runQuery(question)
                }}
                disabled={!question.trim()}
                className="absolute right-2 top-2 bottom-2 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-3.5"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <FilterButton
                label="All"
                active={filter === "all"}
                onClick={() => setFilter("all")}
              />
              <FilterButton
                label="Action Items"
                active={filter === "action_item"}
                onClick={() => setFilter("action_item")}
              />
              <FilterButton
                label="Decisions"
                active={filter === "decision"}
                onClick={() => setFilter("decision")}
              />
              <FilterButton
                label="Blockers"
                active={filter === "blocker"}
                onClick={() => setFilter("blocker")}
              />
            </div>
            <p className="text-center text-[11px] text-text-muted mt-3">
              Trace may display inaccurate info, so double-check its responses.
            </p>
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
      className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
        active 
          ? "bg-primary text-white shadow-sm" 
          : "bg-bg-surface text-text-secondary hover:bg-border-light"
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
      <div className="group rounded-2xl border border-border-light bg-white p-4 shadow-sm transition-all hover:shadow-md">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="h-2 w-2 rounded-full mt-1.5 bg-[var(--success)]" />
          </div>
          <div className="space-y-1.5 flex-1">
            <p className="text-[14px] font-medium text-text-primary leading-snug">{result.task}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-text-secondary">
              <span className="flex items-center gap-1 rounded-md bg-bg-surface px-1.5 py-0.5"><span className="text-text-muted">Owner:</span> {result.owner}</span>
              {result.deadline && <span className="flex items-center gap-1 rounded-md bg-bg-surface px-1.5 py-0.5"><span className="text-text-muted">Due:</span> {result.deadline}</span>}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (filterType === "decision") {
    return (
      <div className="group rounded-2xl border border-border-light bg-white p-4 shadow-sm transition-all hover:shadow-md">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="h-2 w-2 rounded-full mt-1.5 bg-[var(--info)]" />
          </div>
          <div className="space-y-1.5 flex-1">
            <p className="text-[14px] font-medium text-text-primary leading-snug">{result.decision}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-text-secondary">
              <span className="flex items-center gap-1 rounded-md bg-bg-surface px-1.5 py-0.5"><span className="text-text-muted">By:</span> {result.made_by}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="group rounded-2xl border border-border-light bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="h-2 w-2 rounded-full mt-1.5 bg-[var(--danger)]" />
        </div>
        <div className="space-y-1.5 flex-1">
          <p className="text-[14px] font-medium text-text-primary leading-snug">{result.blocker}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-text-secondary">
            <span className="flex items-center gap-1 rounded-md bg-bg-surface px-1.5 py-0.5 text-[#7f1d1d]"><span className="text-text-muted opacity-70">Affects:</span> {result.affects}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
