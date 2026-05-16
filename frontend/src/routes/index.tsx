import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Upload,
  FileText,
  Layers,
  MessageSquare,
  Mic,
  CheckSquare,
  Zap,
  AlertTriangle,
  Search,
  Archive,
  ClipboardList,
  TrendingUp,
  Code2,
  CheckCircle2,
} from "lucide-react";
import { WaveformIcon } from "@/components/WaveformIcon";
import { LandingNavbar } from "@/components/LandingNavbar";
import { usePageTitle } from "@/hooks/usePageTitle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trace — Meeting Intelligence" },
      {
        name: "description",
        content:
          "Upload a recording — Trace transcribes every word, identifies each speaker, and surfaces every action item, decision, and blocker.",
      },
      { property: "og:title", content: "Trace — Meeting Intelligence" },
      {
        property: "og:description",
        content: "Every meeting. Every decision. Nothing lost.",
      },
    ],
  }),
  component: LandingPage,
});

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
});

function LandingPage() {
  usePageTitle("Trace — Meeting Intelligence");
  return (
    <div className="min-h-screen bg-white" style={{ color: "var(--ink-1)" }}>
      <LandingNavbar />
      <Hero />
      <ProductPreview />
      <HowItWorks />
      <Features />
      <SocialProof />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="min-h-[calc(100vh-56px)] flex flex-col md:flex-row items-center justify-between px-6 md:px-24 pt-12 pb-20 max-w-[1400px] mx-auto gap-12">
      {/* Left Column */}
      <div className="flex-1 max-w-[540px]">
        <motion.div
          {...fade(0)}
          className="text-[12px] font-semibold uppercase mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ letterSpacing: "0.1em", color: "var(--ink-2)", background: "var(--surface)" }}
        >
          <WaveformIcon size={14} />
          Trace Meeting Intelligence
        </motion.div>
        
        <motion.h1
          {...fade(0.1)}
          className="font-bold tracking-tighter"
          style={{
            fontSize: "clamp(56px, 8vw, 84px)",
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            color: "var(--ink-1)",
          }}
        >
          Every meeting.<br />
          Every decision.<br />
          <span style={{ color: "var(--ink-3)" }}>Nothing lost.</span>
        </motion.h1>
        
        <motion.p
          {...fade(0.2)}
          className="mt-8 text-[20px] font-medium leading-[1.4]"
          style={{ color: "var(--ink-2)", maxWidth: "90%" }}
        >
          Upload a recording — Trace transcribes every word, identifies each speaker, and surfaces every action item, decision, and blocker.
        </motion.p>
        
        <motion.div {...fade(0.4)} className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-2 h-12 px-6 rounded-[8px] text-[15px] font-semibold text-white transition-all transform hover:-translate-y-0.5"
            style={{ background: "var(--accent)" }}
          >
            Upload your first meeting
            <ArrowRight size={16} strokeWidth={2} color="var(--white)" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[8px] text-[15px] font-semibold transition-all"
            style={{ 
              background: "transparent",
              border: "1px solid var(--border-mid)",
              color: "var(--ink-1)"
            }}
          >
            See how it works
          </a>
        </motion.div>
        <motion.div {...fade(0.5)} className="mt-6 text-[13px] font-medium" style={{ color: "var(--ink-3)" }}>
          No account needed · Runs locally
        </motion.div>
      </div>

      {/* Right Column (Card) */}
      <motion.div
        {...fade(0.2)}
        className="flex-1 w-full"
      >
        <div 
          className="rounded-[24px] p-10 md:p-14 h-full flex flex-col justify-center min-h-[400px] transition-shadow shadow-sm hover:shadow-md"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h2 
            className="font-bold tracking-tight mb-6"
            style={{ fontSize: "clamp(28px, 4vw, 36px)", lineHeight: 1.15, color: "var(--ink-1)" }}
          >
            Ask anything about your meeting history
          </h2>
          <p 
            className="text-[17px] leading-[1.65] font-medium"
            style={{ color: "var(--ink-3)" }}
          >
            Trace acts as an intelligent memory for your team. Use natural language to search across all your past meetings to pull exact quotes, check assigned tasks, or recall context you forgot.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

function ProductPreview() {
  return (
    <section className="px-6 pt-16 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: 0.05, type: "spring", bounce: 0.15 }}
        className="mx-auto rounded-xl"
        style={{
          maxWidth: 960,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          padding: 16,
          boxShadow: "0 32px 64px rgba(0,0,0,0.08)",
        }}
      >
        <div
          className="rounded-lg overflow-hidden bg-white"
          style={{ border: "1px solid var(--border)" }}
        >
          {/* Browser chrome */}
          <div
            className="h-9 flex items-center px-4 gap-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: "#f87171" }} />
              <span className="w-2 h-2 rounded-full" style={{ background: "#fbbf24" }} />
              <span className="w-2 h-2 rounded-full" style={{ background: "#34d399" }} />
            </div>
            <div
              className="mx-auto px-3 py-1 rounded-md font-mono text-[12px]"
              style={{ background: "var(--surface)", color: "var(--ink-3)" }}
            >
              trace.app/dashboard
            </div>
          </div>
          {/* App content */}
          <div className="grid" style={{ gridTemplateColumns: "55% 45%" }}>
            <div className="p-5">
              {[
                { t: "Q3 Engineering Sync", d: "Nov 12 · 42 min", tag: "review", tasks: 7, dec: 3, selected: true },
                { t: "Product Roadmap Review", d: "Nov 10 · 1h 12m", tag: "planning", tasks: 12, dec: 5 },
                { t: "Weekly Standup", d: "Nov 9 · 18 min", tag: "standup", tasks: 4, dec: 1 },
              ].map((m, i) => (
                <div
                  key={i}
                  className="py-3 flex items-center gap-3"
                  style={{
                    borderBottom: i < 2 ? "1px solid var(--border)" : "none",
                    borderLeft: m.selected ? "3px solid var(--blue)" : "3px solid transparent",
                    paddingLeft: 8,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate" style={{ color: "var(--ink-1)" }}>
                      {m.t}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-3)" }}>
                      {m.d}
                    </div>
                  </div>
                  <Tag tag={m.tag} />
                  <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--green-dim)", color: "var(--green)" }}>
                    {m.tasks} tasks
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
                    {m.dec} dec
                  </span>
                </div>
              ))}
            </div>
            <div className="p-5" style={{ background: "var(--surface)", borderLeft: "1px solid var(--border)" }}>
              <div
                className="h-9 rounded-md flex items-center px-3 text-[12px]"
                style={{ background: "white", border: "1px solid var(--border)", color: "var(--ink-3)" }}
              >
                Ask anything about your meetings
              </div>
              <div className="mt-4">
                <span
                  className="inline-block text-[12px] px-2.5 py-1 rounded-md mb-3"
                  style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-mid)" }}
                >
                  What are the open action items?
                </span>
                <div
                  className="rounded-lg p-3 space-y-2"
                  style={{ background: "white", border: "1px solid var(--border)" }}
                >
                  {[
                    "Ship API contract to mobile by Friday",
                    "Confirm staging env for QA team",
                    "Resolve auth token expiry on retry path",
                  ].map((t) => (
                    <div key={t} className="flex items-start gap-2 text-[12px]" style={{ color: "var(--ink-1)" }}>
                      <CheckCircle2 size={14} strokeWidth={1.5} style={{ color: "var(--green)", marginTop: 1, flexShrink: 0 }} />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] mt-2" style={{ color: "var(--ink-3)" }}>
                  4 sources found
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Tag({ tag }: { tag: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    planning: { bg: "var(--blue-dim)", color: "var(--blue)" },
    review: { bg: "var(--green-dim)", color: "var(--green)" },
    standup: { bg: "var(--amber-dim)", color: "var(--amber)" },
  };
  const s = map[tag] ?? { bg: "var(--surface-2)", color: "var(--ink-2)" };
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded-full capitalize"
      style={{ background: s.bg, color: s.color }}
    >
      {tag}
    </span>
  );
}

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto text-center mb-12" style={{ maxWidth: 600 }}>
      <div
        className="text-[11px] font-semibold uppercase mb-3"
        style={{ letterSpacing: "0.08em", color: "var(--ink-3)" }}
      >
        {eyebrow}
      </div>
      <h2
        className="font-bold"
        style={{ fontSize: 40, lineHeight: 1.1, letterSpacing: "-0.03em", color: "var(--ink-1)" }}
      >
        {title}
      </h2>
      {sub && (
        <p className="mt-4 text-[15px]" style={{ color: "var(--ink-2)", lineHeight: 1.6 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { Icon: Upload, title: "Upload the recording", body: "Drop any audio or video file. MP3, MP4, WAV, M4A, OGG all work." },
    { Icon: FileText, title: "Transcribed automatically", body: "Whisper AI transcribes every word with speaker identification and timestamps." },
    { Icon: Layers, title: "Insights extracted", body: "Action items, decisions, and blockers pulled with owners and deadlines." },
    { Icon: MessageSquare, title: "Ask anything", body: "Query your entire meeting history in plain English. Answers in seconds." },
  ];
  return (
    <section id="how-it-works" className="px-6 py-24" style={{ background: "var(--surface)" }}>
      <SectionHeader
        eyebrow="How it works"
        title="From audio file to searchable insight"
        sub="Four steps. Fully automatic. No configuration needed."
      />
      <div className="mx-auto relative" style={{ maxWidth: 1100 }}>
        <div
          className="hidden md:block absolute left-12 right-12"
          style={{ top: 60, height: 1, background: "var(--border-mid)" }}
        />
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white rounded-xl p-7 transition-all"
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
              <div
                className="inline-flex items-center justify-center rounded-full text-[14px] font-semibold mb-4"
                style={{ width: 32, height: 32, background: "var(--accent-dim)", color: "var(--accent)" }}
              >
                {i + 1}
              </div>
              <s.Icon size={20} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
              <h3 className="text-[15px] font-semibold mt-3" style={{ color: "var(--ink-1)" }}>
                {s.title}
              </h3>
              <p className="text-[13px] mt-2" style={{ color: "var(--ink-2)", lineHeight: 1.6 }}>
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { Icon: Mic, color: "var(--accent)", bg: "var(--accent-dim)", title: "Speaker identification", body: "Every segment labeled by speaker. Know who said what, when, across every meeting in your library." },
    { Icon: CheckSquare, color: "var(--green)", bg: "var(--green-dim)", title: "Action item extraction", body: "Tasks captured with owner and deadline. Never misplace a commitment made in a meeting again." },
    { Icon: Zap, color: "var(--blue)", bg: "var(--blue-dim)", title: "Decision tracking", body: "Decisions logged with context — who was in the room, what was discussed, and what was resolved." },
    { Icon: AlertTriangle, color: "var(--amber)", bg: "var(--amber-dim)", title: "Blocker detection", body: "Blockers surfaced automatically from the transcript. See what is slowing your team before it compounds." },
    { Icon: Search, color: "var(--accent)", bg: "var(--accent-dim)", title: "Natural language search", body: "Ask a question as you would ask a colleague. Trace searches all your meetings and returns grounded answers." },
    { Icon: Archive, color: "var(--ink-3)", bg: "var(--surface)", title: "Persistent meeting memory", body: "Every meeting indexed and retrievable. Your team's decisions and commitments never get buried." },
  ];
  return (
    <section id="features" className="px-6 py-24 bg-white">
      <SectionHeader eyebrow="Features" title="Built around the way teams actually work" />
      <div className="mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ maxWidth: 960 }}>
        {items.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className="bg-white rounded-xl p-7 transition-all"
            style={{ border: "1px solid var(--border)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-mid)";
              e.currentTarget.style.boxShadow = "var(--shadow-lift)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              className="inline-flex items-center justify-center rounded-md"
              style={{ width: 36, height: 36, background: f.bg }}
            >
              <f.Icon size={20} strokeWidth={1.5} style={{ color: f.color }} />
            </div>
            <h3 className="text-[15px] font-semibold mt-4" style={{ color: "var(--ink-1)" }}>
              {f.title}
            </h3>
            <p className="text-[13px] mt-2" style={{ color: "var(--ink-2)", lineHeight: 1.65 }}>
              {f.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function SocialProof() {
  const personas = [
    {
      Icon: ClipboardList,
      role: "Project Manager",
      quote:
        "I used to spend 30 minutes after every meeting writing up notes. Now I upload the recording and everything is done.",
      tags: ["Action item tracking", "Deadline management", "Team accountability"],
    },
    {
      Icon: TrendingUp,
      role: "Startup Founder",
      quote:
        "We run 15 meetings a week. Trace is the only way I can keep track of what was decided and who is responsible for what.",
      tags: ["Decision history", "Cross-meeting search", "Team alignment"],
    },
    {
      Icon: Code2,
      role: "Engineering Lead",
      quote:
        "The blocker detection catches things people forget to raise in standup. It has prevented at least three incidents this quarter.",
      tags: ["Blocker detection", "Sprint planning", "Engineering accountability"],
    },
  ];
  return (
    <section className="px-6 py-24" style={{ background: "var(--surface)" }}>
      <SectionHeader eyebrow="Who uses Trace" title="Teams that cannot afford to lose context" />
      <div className="mx-auto space-y-4" style={{ maxWidth: 800 }}>
        {personas.map((p, i) => (
          <motion.div
            key={p.role}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-white rounded-xl p-8 flex gap-6"
            style={{ border: "1px solid var(--border)" }}
          >
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-[10px]"
              style={{ width: 64, height: 64, background: "var(--accent-dim)" }}
            >
              <p.Icon size={28} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
            </div>
            <div className="flex-1">
              <div
                className="text-[11px] font-semibold uppercase mb-2"
                style={{ letterSpacing: "0.08em", color: "var(--ink-3)" }}
              >
                {p.role}
              </div>
              <p className="italic text-[15px]" style={{ color: "var(--ink-1)", lineHeight: 1.7 }}>
                {p.quote}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[12px] font-medium px-2.5 py-1 rounded-full"
                    style={{
                      background: "var(--surface-2)",
                      color: "var(--ink-2)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="pricing" className="px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto rounded-xl text-center px-10 py-24"
        style={{ background: "var(--accent)", maxWidth: 960 }}
      >
        <h2
          className="font-bold text-white"
          style={{ fontSize: 40, lineHeight: 1.1, letterSpacing: "-0.025em" }}
        >
          Ready to reclaim your meetings?
        </h2>
        <p
          className="mt-4 text-[16px]"
          style={{ color: "rgba(255,255,255,0.8)" }}
        >
          Upload your first recording and see what your team has been missing.
        </p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex items-center h-11 px-7 rounded-md text-[15px] font-semibold transition-all"
          style={{ background: "white", color: "var(--accent)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.92";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Get started
        </Link>
        <div className="mt-5 text-[13px]" style={{ color: "rgba(255,255,255,0.55)" }}>
          No signup required · Runs on your machine
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      className="h-16 flex items-center justify-between px-6 bg-white"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-2 text-[13px]" style={{ color: "var(--ink-3)" }}>
        <WaveformIcon size={16} />
        <span className="font-semibold" style={{ color: "var(--ink-1)" }}>
          Trace
        </span>
        <span>Meeting Intelligence</span>
      </div>
      <div className="text-[13px]" style={{ color: "var(--ink-3)" }}>
        Built with local AI · Your data never leaves
      </div>
    </footer>
  );
}
