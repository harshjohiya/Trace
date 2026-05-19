import { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { queryMeetings, type QueryResponse } from "@/lib/api";

export function QuickAskBar() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<QueryResponse | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  const submit = async () => {
    if (!q.trim()) return;
    setLoading(true);
    setOpen(true);
    setRes(null);
    try {
      const r = await queryMeetings(q);
      setRes(r);
    } catch {
      setRes({ answer: "Could not reach Trace.", confidence: "low", results: [], sources: [], filter_type: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={ref}
      className="sticky bottom-0 z-30"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="mx-auto"
            style={{
              maxWidth: 800,
              background: "white",
              boxShadow: "var(--shadow-modal)",
              borderRadius: "12px 12px 0 0",
              maxHeight: 320,
              overflowY: "auto",
              padding: 20,
            }}
          >
            {loading && (
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
                Searching your meetings…
              </div>
            )}
            {res && (
              <>
                <div
                  className="text-[14px] leading-[1.75] whitespace-pre-wrap"
                  style={{ color: "var(--ink-1)" }}
                >
                  {res.answer}
                </div>
                {res.results.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {res.results.slice(0, 6).map((r, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full"
                        style={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          color: "var(--ink-2)",
                        }}
                      >
                        {r.meeting_title}
                        <span style={{ color: "var(--ink-3)" }}>
                          · {Math.round(r.relevance_score * 100)}%
                        </span>
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => nav({ to: "/ask" })}
                  className="mt-3 text-[13px] font-medium"
                  style={{ color: "var(--accent)" }}
                >
                  Full search in Ask Trace →
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mx-auto px-6 py-3" style={{ maxWidth: 1200 }}>
        <div className="relative flex items-center">
          <Sparkles
            size={16}
            strokeWidth={1.5}
            className="absolute left-3 pointer-events-none"
            style={{ color: "var(--accent-mid)" }}
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Ask anything about your meetings..."
            className="w-full h-10 pl-10 pr-12 text-[13px] rounded-md outline-none transition-all"
            style={{
              border: "1px solid var(--border)",
              background: "white",
              color: "var(--ink-1)",
            }}
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
            onClick={submit}
            disabled={!q.trim()}
            className="absolute right-1.5 inline-flex items-center justify-center rounded-md transition-opacity disabled:opacity-40"
            style={{ width: 32, height: 32, background: "var(--accent)" }}
            aria-label="Submit"
          >
            <ArrowRight size={16} strokeWidth={1.5} color="var(--white)" />
          </button>
        </div>
      </div>
    </div>
  );
}
