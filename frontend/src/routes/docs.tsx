import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Zap,
  Lock,
  Upload,
  List,
  Search,
  Trash2,
  ChevronRight,
  Terminal,
  HelpCircle,
  ArrowUpRight,
} from "lucide-react";
import { WaveformIcon } from "@/components/WaveformIcon";
import { LandingNavbar } from "@/components/LandingNavbar";

export const Route = createFileRoute("/docs")({
  component: DocsPage,
});

// ── Section definitions ────────────────────────────────────────────────────

const NAV = [
  {
    group: "Getting Started",
    icon: BookOpen,
    items: [
      { id: "overview", label: "Overview" },
      { id: "quickstart", label: "Quick Start" },
    ],
  },
  {
    group: "Authentication",
    icon: Lock,
    items: [{ id: "auth", label: "Authentication" }],
  },
  {
    group: "REST API",
    icon: Terminal,
    items: [
      { id: "upload", label: "Upload Recording" },
      { id: "jobs", label: "Job Status" },
      { id: "meetings-list", label: "List Meetings" },
      { id: "meetings-get", label: "Get Meeting" },
      { id: "meetings-delete", label: "Delete Meeting" },
      { id: "query", label: "Query / Ask Trace" },
    ],
  },
  {
    group: "FAQ",
    icon: HelpCircle,
    items: [{ id: "faq", label: "FAQ" }],
  },
];

// ── Shared micro-components ────────────────────────────────────────────────

function Badge({ label, color }: { label: string; color: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    POST:   { bg: "#EFF8F0", text: "#2D7D46" },
    GET:    { bg: "#EDF3FB", text: "#2B5EA7" },
    DELETE: { bg: "#FDF0F0", text: "#C53030" },
    BETA:   { bg: "#FDF5E6", text: "#A0620D" },
  };
  const c = colors[color] ?? { bg: "var(--surface)", text: "var(--ink-2)" };
  return (
    <span
      className="inline-flex items-center h-5 px-2 rounded text-[11px] font-bold tracking-wide uppercase"
      style={{ background: c.bg, color: c.text }}
    >
      {label}
    </span>
  );
}

function Code({ children, lang = "" }: { children: string; lang?: string }) {
  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{ background: "#1A1A1A", border: "1px solid #2E2E2E" }}
    >
      {lang && (
        <div
          className="px-4 py-2 text-[11px] font-medium tracking-wider uppercase border-b"
          style={{ color: "#7A756E", borderColor: "#2E2E2E" }}
        >
          {lang}
        </div>
      )}
      <pre
        className="p-4 text-[13px] leading-relaxed overflow-x-auto"
        style={{ color: "#FAF6F1", fontFamily: "JetBrains Mono, monospace" }}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
}

function EndpointCard({
  method,
  path,
  description,
  auth = true,
  children,
}: {
  method: string;
  path: string;
  description: string;
  auth?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-6 mb-6"
      style={{ background: "var(--white)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <Badge label={method} color={method} />
        <code
          className="text-[14px] font-semibold"
          style={{ color: "var(--ink-1)", fontFamily: "JetBrains Mono, monospace" }}
        >
          {path}
        </code>
        {auth && (
          <span
            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
            style={{ background: "var(--amber-dim)", color: "var(--amber)" }}
          >
            <Lock size={10} /> Auth required
          </span>
        )}
      </div>
      <p className="text-[14px] mb-4" style={{ color: "var(--ink-2)" }}>
        {description}
      </p>
      {children}
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-14 scroll-mt-20">
      <h2
        className="text-[22px] font-bold mb-6 pb-3"
        style={{ color: "var(--ink-1)", borderBottom: "1px solid var(--border)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

function DocsPage() {
  const [active, setActive] = useState("overview");

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--white)" }}>
      <LandingNavbar />

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 flex gap-10">
        {/* ── Sidebar ── */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="sticky top-24">
            <p
              className="text-[11px] font-bold uppercase tracking-widest mb-4"
              style={{ color: "var(--ink-4)" }}
            >
              Documentation
            </p>
            {NAV.map(({ group, icon: Icon, items }) => (
              <div key={group} className="mb-6">
                <div
                  className="flex items-center gap-2 mb-2 text-[12px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--ink-3)" }}
                >
                  <Icon size={13} />
                  {group}
                </div>
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors mb-0.5"
                    style={{
                      background: active === item.id ? "var(--accent-dim)" : "transparent",
                      color: active === item.id ? "var(--accent)" : "var(--ink-2)",
                    }}
                  >
                    {active === item.id && <ChevronRight size={12} />}
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 min-w-0 max-w-3xl">

          {/* ── Overview ── */}
          <Section id="overview" title="Overview">
            <div
              className="flex items-center gap-4 p-5 rounded-xl mb-6"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <WaveformIcon size={36} />
              <div>
                <p className="text-[15px] font-semibold" style={{ color: "var(--ink-1)" }}>
                  Trace — Meeting Intelligence API
                </p>
                <p className="text-[13px] mt-0.5" style={{ color: "var(--ink-2)" }}>
                  Upload recordings. Get transcripts, action items, decisions, and blockers — all searchable with natural language.
                </p>
              </div>
            </div>
            <p className="text-[14px] leading-relaxed mb-4" style={{ color: "var(--ink-2)" }}>
              Trace is a full-stack meeting intelligence platform. The backend exposes a
              FastAPI REST API that accepts audio/video files, runs them through a
              Groq-powered transcription and extraction pipeline, indexes the results into
              ChromaDB, and lets you query everything in plain English.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              {[
                { icon: Upload, label: "Upload", desc: "Any audio/video format — mp3, mp4, wav, m4a, webm…" },
                { icon: Zap, label: "Extract", desc: "Action items, decisions, blockers, speakers & summary." },
                { icon: Search, label: "Query", desc: "Ask anything in natural language across all meetings." },
              ].map(({ icon: I, label, desc }) => (
                <div
                  key={label}
                  className="rounded-xl p-5"
                  style={{ background: "var(--white)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
                >
                  <I size={20} style={{ color: "var(--accent)" }} />
                  <p className="mt-3 text-[14px] font-semibold" style={{ color: "var(--ink-1)" }}>{label}</p>
                  <p className="mt-1 text-[13px]" style={{ color: "var(--ink-3)" }}>{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Quick Start ── */}
          <Section id="quickstart" title="Quick Start">
            <p className="text-[14px] leading-relaxed mb-5" style={{ color: "var(--ink-2)" }}>
              All authenticated endpoints require a{" "}
              <code className="text-[13px] px-1.5 py-0.5 rounded" style={{ background: "var(--surface)", color: "var(--ink-1)" }}>
                Bearer
              </code>{" "}
              token from Supabase. Sign in via the app, grab the session token, then call
              the API directly.
            </p>
            <Code lang="bash">{`# 1. Upload a recording
curl -X POST https://your-render-url.onrender.com/meetings/upload \\
  -H "Authorization: Bearer <supabase_access_token>" \\
  -F "file=@standup.mp3"

# Response → { "job_id": "job_abc123", "meeting_id": "meeting_xyz", "status": "queued" }

# 2. Poll until complete
curl https://your-render-url.onrender.com/jobs/job_abc123 \\
  -H "Authorization: Bearer <supabase_access_token>"

# 3. Fetch the meeting data
curl https://your-render-url.onrender.com/meetings/meeting_xyz \\
  -H "Authorization: Bearer <supabase_access_token>"

# 4. Ask a question
curl -X POST https://your-render-url.onrender.com/query \\
  -H "Authorization: Bearer <supabase_access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{"question": "What did we decide about the launch date?"}'`}</Code>
          </Section>

          {/* ── Auth ── */}
          <Section id="auth" title="Authentication">
            <p className="text-[14px] leading-relaxed mb-5" style={{ color: "var(--ink-2)" }}>
              Trace uses{" "}
              <a href="https://supabase.com/docs/guides/auth" target="_blank" rel="noreferrer"
                className="font-medium underline" style={{ color: "var(--accent)" }}>
                Supabase Auth
              </a>{" "}
              for identity. All protected endpoints verify the JWT signature against the
              project's JWKS endpoint using ES256. Tokens are short-lived (~1 hour) and
              automatically refreshed by the frontend.
            </p>
            <Code lang="http">{`Authorization: Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...`}</Code>
            <div
              className="mt-5 flex gap-3 p-4 rounded-xl"
              style={{ background: "var(--amber-dim)", border: "1px solid var(--amber-mid)" }}
            >
              <span className="text-[20px]">⚠️</span>
              <p className="text-[13px]" style={{ color: "var(--amber)" }}>
                Never share your Supabase <strong>service_role</strong> key publicly. The
                frontend only ever uses the <strong>anon</strong> key + a short-lived user
                session token.
              </p>
            </div>
          </Section>

          {/* ── Upload ── */}
          <Section id="upload" title="Upload Recording">
            <EndpointCard
              method="POST"
              path="/meetings/upload"
              description="Upload an audio or video file. Returns a job_id to poll for processing status. Duplicate files (same SHA-256 per user) return the existing meeting immediately."
            >
              <p className="text-[13px] font-semibold mb-2" style={{ color: "var(--ink-2)" }}>Supported formats</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {[".mp3", ".mp4", ".wav", ".m4a", ".ogg", ".webm", ".flac"].map((ext) => (
                  <code key={ext} className="text-[12px] px-2 py-0.5 rounded" style={{ background: "var(--surface)", color: "var(--ink-1)" }}>{ext}</code>
                ))}
              </div>
              <Code lang="bash">{`curl -X POST /meetings/upload \\
  -H "Authorization: Bearer <token>" \\
  -F "file=@recording.mp4" \\
  -F "diarization_enabled=false"   # optional — enable speaker diarization`}</Code>
              <Code lang="json">{`// Response
{
  "job_id":     "job_abc123",
  "meeting_id": "meeting_xyz456",
  "status":     "queued",
  "message":    "Processing started. Poll /jobs/{job_id} for status."
}`}</Code>
            </EndpointCard>
          </Section>

          {/* ── Jobs ── */}
          <Section id="jobs" title="Job Status">
            <EndpointCard
              method="GET"
              path="/jobs/{job_id}"
              description="Poll this endpoint to track pipeline progress. Progress goes from 0 → 100 across four stages: converting → transcribing → extracting → indexing."
              auth={false}
            >
              <Code lang="json">{`// Processing
{
  "job_id":     "job_abc123",
  "meeting_id": "meeting_xyz456",
  "status":     "transcribing",   // queued | converting | transcribing | extracting | indexing | completed | failed
  "progress":   25,
  "error":      null
}

// Completed
{
  "job_id":             "job_abc123",
  "meeting_id":         "meeting_xyz456",
  "status":             "completed",
  "progress":           100,
  "processing_time_sec": 87.4
}`}</Code>
            </EndpointCard>
          </Section>

          {/* ── List Meetings ── */}
          <Section id="meetings-list" title="List Meetings">
            <EndpointCard
              method="GET"
              path="/meetings"
              description="Returns a summary list of all meetings processed by the authenticated user, sorted newest first."
            >
              <Code lang="json">{`{
  "meetings": [
    {
      "meeting_id":   "meeting_xyz456",
      "title":        "Q3 Planning Standup",
      "meeting_type": "standup",
      "created_at":   "2026-07-08T09:30:00Z",
      "duration_sec": 1820,
      "speakers":     ["Alice", "Bob", "Carol"],
      "action_items": 4,
      "decisions":    2,
      "blockers":     1
    }
  ],
  "count": 1
}`}</Code>
            </EndpointCard>
          </Section>

          {/* ── Get Meeting ── */}
          <Section id="meetings-get" title="Get Meeting">
            <EndpointCard
              method="GET"
              path="/meetings/{meeting_id}"
              description="Returns the full extraction for a single meeting — title, summary, action items, decisions, blockers, key topics, and speaker list."
            >
              <Code lang="json">{`{
  "meeting_id":   "meeting_xyz456",
  "title":        "Q3 Planning Standup",
  "meeting_type": "standup",
  "summary":      "The team reviewed Q3 OKRs and agreed on a July 15 soft launch...",
  "key_topics":   ["OKRs", "launch date", "design review"],
  "speakers":     ["Alice", "Bob"],
  "action_items": [
    { "task": "Finalise landing page copy", "owner": "Alice", "deadline": "Jul 12", "assigned_by": "Bob" }
  ],
  "decisions": [
    { "decision": "Launch moved to July 15", "made_by": "Bob" }
  ],
  "blockers": [
    { "blocker": "Design assets not ready", "raised_by": "Carol" }
  ]
}`}</Code>
            </EndpointCard>
          </Section>

          {/* ── Delete Meeting ── */}
          <Section id="meetings-delete" title="Delete Meeting">
            <EndpointCard
              method="DELETE"
              path="/meetings/{meeting_id}"
              description="Permanently removes a meeting — including the audio file, transcript, extraction JSON, vector index entries, and hash registry entry so the same file can be re-uploaded."
            >
              <Code lang="json">{`{
  "meeting_id": "meeting_xyz456",
  "deleted":    ["extraction", "transcript", "vector_extractions", "vector_transcripts", "hash_registry"],
  "errors":     [],
  "message":    "Meeting meeting_xyz456 removed successfully"
}`}</Code>
            </EndpointCard>
          </Section>

          {/* ── Query ── */}
          <Section id="query" title="Query / Ask Trace">
            <EndpointCard
              method="POST"
              path="/query"
              description="Ask a natural language question across all of your meetings. Optionally scope by type (action_item | decision | blocker) for precise structured lookups."
            >
              <Code lang="json">{`// RAG query (no filter_type)
{
  "question": "What did we decide about the launch date?"
}

// Filtered structured query
{
  "question":    "Who needs to do design work?",
  "filter_type": "action_item"   // action_item | decision | blocker
}`}</Code>
              <Code lang="json">{`// RAG response
{
  "question":   "What did we decide about the launch date?",
  "answer":     "The team decided to move the launch to July 15 during the Q3 Planning standup.",
  "confidence": "high",          // high | medium | low
  "sources": [
    { "type": "decision", "meeting_id": "meeting_xyz456", "score": 0.91 }
  ]
}

// Filtered response
{
  "question":    "Who needs to do design work?",
  "filter_type": "action_item",
  "results": [
    {
      "text":       "Action item: Finalise landing page copy. Owner: Alice. Deadline: Jul 12.",
      "score":      0.87,
      "type":       "action_item",
      "meeting_id": "meeting_xyz456"
    }
  ],
  "count": 1
}`}</Code>
            </EndpointCard>
          </Section>

          {/* ── FAQ ── */}
          <Section id="faq" title="FAQ">
            {[
              {
                q: "How long does processing take?",
                a: "Typically 1–3 minutes for a 30-minute meeting. The bottleneck is Groq Whisper transcription. Diarization adds another 30–60 seconds.",
              },
              {
                q: "What happens if I upload the same file twice?",
                a: "Trace hashes every upload (SHA-256) per user. If the same audio is detected, it returns the existing meeting_id instantly and skips re-processing.",
              },
              {
                q: "Is diarization accurate?",
                a: "Speaker diarization uses pyannote.audio and requires a Hugging Face token. Accuracy depends on audio quality — clean single-microphone recordings work best. You can disable it with diarization_enabled=false.",
              },
              {
                q: "Where is my data stored?",
                a: "Audio files, transcripts, and extraction JSONs are stored on the Render instance (ephemeral — cleared on redeploy). Vector embeddings live in ChromaDB on disk. User accounts are stored in Supabase Postgres.",
              },
              {
                q: "Can I query across multiple meetings at once?",
                a: "Yes. POST /query searches all of your meetings simultaneously using ChromaDB semantic search + Groq LLM context-building.",
              },
            ].map(({ q, a }, i) => (
              <FaqItem key={i} q={q} a={a} />
            ))}
          </Section>

          {/* ── Footer ── */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-xl mt-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3">
              <WaveformIcon size={24} />
              <span className="text-[14px] font-medium" style={{ color: "var(--ink-1)" }}>
                Ready to get started?
              </span>
            </div>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 h-9 px-5 rounded-lg text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)" }}
            >
              Open Trace <ArrowUpRight size={14} />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="mb-3 rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
    >
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
        style={{ background: open ? "var(--surface)" : "var(--white)" }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-[14px] font-semibold" style={{ color: "var(--ink-1)" }}>
          {q}
        </span>
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight size={16} style={{ color: "var(--ink-3)" }} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <p
              className="px-5 py-4 text-[14px] leading-relaxed"
              style={{ color: "var(--ink-2)", borderTop: "1px solid var(--border)" }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
