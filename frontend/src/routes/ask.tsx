import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Layers,
  Sparkles,
  ArrowRight,
  ChevronDown,
  CheckSquare,
  Zap,
  AlertTriangle,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppNavbar } from "@/components/AppNavbar";
import { ConnectionGuard } from "@/components/ConnectionGuard";
import { WaveformIcon } from "@/components/WaveformIcon";
import { queryMeetings, type QueryResponse } from "@/lib/api";
import { usePageTitle } from "@/hooks/usePageTitle";

export const Route = createFileRoute("/ask")({
  head: () => ({ meta: [{ title: "Ask Trace" }] }),
  component: AskPage,
});

const SUGGESTED = [
  "What are all open action items?",
  "Which decisions need follow-up?",
  "Who has the most outstanding tasks?",
  "What blockers are unresolved?",
  "Summarize the most recent meeting",
  "What topics came up across meetings?",
  "Who assigned the most tasks?",
  "What was decided about onboarding?",
];

const EXAMPLES: { Icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>; text: string }[] = [
  { Icon: CheckSquare, text: "Show me all action items assigned this week" },
  { Icon: Zap, text: "What was decided in the last roadmap review?" },
  { Icon: AlertTriangle, text: "What blockers came up in standups?" },
  { Icon: Search, text: "Summarize what we said about pricing" },
];

const FILTERS = [
  { key: null, label: "All" },
  { key: "action_item", label: "Action Items" },
  { key: "decision", label: "Decisions" },
  { key: "blocker", label: "Blockers" },
] as const;

type QAItem = {
  q: string;
  res: QueryResponse | null;
  loading: boolean;
};

import { AuthGuard } from "@/components/AuthGuard";

function AskPage() {
  usePageTitle("Ask Trace");
  return (
    <AuthGuard>
      <ConnectionGuard>
        <Ask />
      </ConnectionGuard>
    </AuthGuard>
  );
}

function Ask() {
  const [input, setInput] = useState("");
  const [items, setItems] = useState<QAItem[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const history = items.map((i) => i.q);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [items]);

  const submit = async (question?: string) => {
    const q = (question ?? input).trim();
    if (!q) return;
    setInput("");
    const idx = items.length;
    setItems((prev) => [...prev, { q, res: null, loading: true }]);
    try {
      const res = await queryMeetings(q, filter ?? undefined);
      setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, res, loading: false } : it)));
    } catch {
      setItems((prev) =>
        prev.map((it, i) =>
          i === idx
            ? {
                ...it,
                res: {
                  answer: "Could not reach Trace.",
                  confidence: "low",
                  results: [],
                  sources: [],
                  filter_type: null,
                },
                loading: false,
              }
            : it,
        ),
      );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppNavbar />
      <div className="flex-1 flex" style={{ height: "calc(100vh - 56px)" }}>
        {/* Sidebar */}
        <aside
          className="hidden md:flex flex-col w-60 flex-shrink-0 bg-white p-5"
          style={{ borderRight: "1px solid var(--border)" }}
        >
          <SidebarHeading>History</SidebarHeading>
          <div className="space-y-1 mb-6 max-h-48 overflow-y-auto">
            {history.length === 0 && (
              <p className="text-[12px]" style={{ color: "var(--ink-3)" }}>
                No queries yet
              </p>
            )}
            {history.map((q, i) => (
              <button
                key={i}
                onClick={() => submit(q)}
                className="w-full text-left text-[13px] px-2 py-1 rounded-md truncate transition-colors"
                style={{ color: "var(--ink-2)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-dim)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {q}
              </button>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--border)" }} className="-mx-5 mb-5" />
          <SidebarHeading>Suggested queries</SidebarHeading>
          <div className="space-y-2">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => submit(s)}
                className="block w-full text-left text-[12px] bg-white rounded-md px-3 py-2 transition-colors"
                style={{ border: "1px solid var(--border)", color: "var(--ink-2)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent-mid)";
                  e.currentTarget.style.color = "var(--accent)";
                  e.currentTarget.style.background = "var(--accent-dim)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--ink-2)";
                  e.currentTarget.style.background = "white";
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8">
            <div className="mx-auto" style={{ maxWidth: 760 }}>
              {items.length === 0 ? (
                <EmptyState onPick={(t) => submit(t)} />
              ) : (
                <div className="space-y-6">
                  {items.map((it, i) => (
                    <QAPair key={i} item={it} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Input bar */}
          <div className="bg-white" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="mx-auto px-6 py-4" style={{ maxWidth: 760 }}>
              <div className="relative">
                <Sparkles
                  size={16}
                  strokeWidth={1.5}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--accent-mid)" }}
                />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Ask anything about your meetings..."
                  className="w-full h-11 pl-10 pr-14 text-[14px] rounded-md outline-none transition-all bg-white"
                  style={{ border: "1px solid var(--border)", color: "var(--ink-1)" }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-dim)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  onClick={() => submit()}
                  disabled={!input.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md disabled:opacity-40"
                  style={{ width: 32, height: 32, background: "var(--accent)" }}
                  aria-label="Submit"
                >
                  <ArrowRight size={16} strokeWidth={1.5} color="var(--white)" />
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={String(f.key)}
                    onClick={() => setFilter(f.key)}
                    className="text-[12px] font-medium h-7 px-3 rounded-full"
                    style={{
                      background: filter === f.key ? "var(--accent)" : "var(--white)",
                      color: filter === f.key ? "var(--white)" : "var(--ink-2)",
                      border: filter === f.key ? "1px solid var(--accent)" : "1px solid var(--border)",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[10px] font-semibold uppercase mb-2"
      style={{ letterSpacing: "0.1em", color: "var(--ink-3)" }}
    >
      {children}
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (t: string) => void }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
      <Layers size={40} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
      <h1 className="mt-6 text-[22px] font-semibold" style={{ color: "var(--ink-1)" }}>
        Ask anything about your meetings
      </h1>
      <p className="mt-2 text-[14px]" style={{ color: "var(--ink-2)" }}>
        Trace searches across everything you have uploaded.
      </p>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full" style={{ maxWidth: 480 }}>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.text}
            onClick={() => onPick(ex.text)}
            className="text-left bg-white rounded-[10px] p-4 flex items-start gap-2 transition-all"
            style={{ border: "1px solid var(--border)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-mid)";
              e.currentTarget.style.boxShadow = "var(--shadow-lift)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <ex.Icon size={16} strokeWidth={1.5} style={{ color: "var(--accent)", marginTop: 2, flexShrink: 0 }} />
            <span className="text-[13px] font-medium" style={{ color: "var(--ink-1)" }}>
              {ex.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function useTypewriter(target: string, enabled: boolean) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    if (!enabled) {
      setShown(target);
      return;
    }
    setShown("");
    let raf = 0;
    let last = performance.now();
    let i = 0;
    const tick = (now: number) => {
      if (now - last >= 12) {
        i = Math.min(target.length, i + Math.max(1, Math.floor((now - last) / 12)));
        setShown(target.slice(0, i));
        last = now;
      }
      if (i < target.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled]);
  return shown;
}

function QAPair({ item }: { item: QAItem }) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const answerText = item.res?.answer ?? "";
  const typed = useTypewriter(answerText, true);
  const conf = item.res?.confidence;
  const confColor =
    conf === "high"
      ? { bg: "var(--green-dim)", color: "var(--green)" }
      : conf === "medium"
        ? { bg: "var(--amber-dim)", color: "var(--amber)" }
        : { bg: "var(--surface-2)", color: "var(--ink-2)" };

  return (
    <div>
      <div className="flex justify-end mb-2">
        <div className="text-right">
          <div className="text-[11px] mb-1" style={{ color: "var(--ink-3)" }}>You</div>
          <span
            className="inline-block text-[14px] font-medium px-4 py-2.5 rounded-md"
            style={{
              background: "var(--accent-dim)",
              border: "1px solid var(--accent-mid)",
              color: "var(--ink-1)",
            }}
          >
            {item.q}
          </span>
        </div>
      </div>
      <div
        className="bg-white rounded-xl p-5"
        style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold" style={{ color: "var(--ink-1)" }}>
              Trace
            </span>
            <WaveformIcon size={16} />
          </div>
          {conf && (
            <span
              className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full"
              style={{ background: confColor.bg, color: confColor.color, letterSpacing: "0.06em" }}
            >
              {conf} confidence
            </span>
          )}
        </div>
        {item.loading ? (
          <div className="flex items-center gap-2 text-[13px]" style={{ color: "var(--ink-3)" }}>
            <span className="inline-flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="inline-block rounded-full"
                  style={{ width: 8, height: 8, background: "var(--accent)" }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </span>
            Searching your meetings...
          </div>
        ) : (
          <>
            <p className="text-[14px] whitespace-pre-wrap" style={{ color: "var(--ink-1)", lineHeight: 1.75 }}>
              {typed}
            </p>
            {((item.res?.results ?? []).length > 0 || (item.res?.sources ?? []).length > 0) && (
              <div className="mt-4">
                <button
                  onClick={() => setSourcesOpen((s) => !s)}
                  className="inline-flex items-center gap-1 text-[12px] font-medium"
                  style={{ color: "var(--ink-3)" }}
                >
                  {(item.res!.results?.length || 0) + (item.res!.sources?.length || 0)} sources
                  <ChevronDown size={12} strokeWidth={1.5} style={{ transform: sourcesOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                <AnimatePresence>
                  {sourcesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(item.res!.results ?? []).map((r, i) => (
                          <span
                            key={`result-${i}`}
                            className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full"
                            style={{
                              background: "var(--surface)",
                              border: "1px solid var(--border)",
                              color: "var(--ink-2)",
                            }}
                          >
                            {r.meeting_title}
                            <span className="text-[11px] capitalize" style={{ color: "var(--ink-3)" }}>
                              · {r.meeting_type}
                            </span>
                            <span className="font-mono text-[11px]" style={{ color: "var(--ink-3)" }}>
                              {Math.round((r.relevance_score ?? 0) * 100)}%
                            </span>
                          </span>
                        ))}
                        {(item.res!.sources ?? []).map((s, i) => (
                          <span
                            key={`source-${i}`}
                            className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full"
                            style={{
                              background: "var(--surface)",
                              border: "1px solid var(--border)",
                              color: "var(--ink-2)",
                            }}
                          >
                            {s.meeting_title ?? "Source"}
                            {s.meeting_type && (
                              <span className="text-[11px] capitalize" style={{ color: "var(--ink-3)" }}>
                                · {s.meeting_type}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
