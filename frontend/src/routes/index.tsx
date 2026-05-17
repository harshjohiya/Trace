import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      <Integrations />
      <HowItWorks />
      <AskTraceOverview />
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

/* ──────────────────────────────────────────────────────── */
/* Integrations — Meeting Apps Showcase                     */
/* ──────────────────────────────────────────────────────── */

const meetingApps: { name: string; color: string; logo: string | React.ReactNode }[] = [
  {
    name: "Zoom",
    color: "#0B5CFF",
    logo: "/logos/zoom.jpg",
  },
  {
    name: "Google Meet",
    color: "#00897B",
    logo: "/logos/google-meet.jpg",
  },
  {
    name: "Microsoft Teams",
    color: "#6264A7",
    logo: "/logos/microsoft-teams.jpg",
  },
  {
    name: "Slack",
    color: "#4A154B",
    logo: "/logos/slack.jpg",
  },
  {
    name: "Webex",
    color: "#049FD9",
    logo: "/logos/webex.jpg",
  },
  {
    name: "Discord",
    color: "#5865F2",
    logo: "/logos/discord.jpg",
  },
  {
    name: "GoTo Meeting",
    color: "#F68D2E",
    logo: "/logos/gotomeeting.jpg",
  },
  {
    name: "Skype",
    color: "#00AFF0",
    logo: "/logos/skype.jpg",
  },
];

function Integrations() {
  const duplicated = [...meetingApps, ...meetingApps, ...meetingApps];
  const row1 = duplicated;
  const row2 = [...duplicated].reverse();

  return (
    <section className="px-6 py-20 overflow-hidden" style={{ background: "var(--white)" }}>
      {/* Inject keyframes */}
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
        .marquee-track { display: flex; width: max-content; }
        .marquee-left  { animation: marquee-left 40s linear infinite; }
        .marquee-right { animation: marquee-right 40s linear infinite; }
        .marquee-wrap:hover .marquee-track { animation-play-state: paused; }
      `}</style>

      <SectionHeader
        eyebrow="Integrations"
        title="Works with every meeting platform"
        sub="Record from any app, upload to Trace, and let AI do the rest. No plugins needed."
      />

      <div className="mx-auto relative" style={{ maxWidth: 1100 }}>
        {/* Row 1 — scrolls left */}
        <div className="marquee-wrap mb-4">
          <div className="marquee-track marquee-left">
            {row1.map((app, i) => (
              <motion.div
                key={`r1-${i}`}
                whileHover={{ scale: 1.06, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex items-center gap-3 px-5 py-4 rounded-xl mx-2 cursor-default select-none transition-colors"
                style={{
                  minWidth: 180,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = app.color;
                  e.currentTarget.style.boxShadow = `0 4px 20px ${app.color}18`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div className="flex-shrink-0">
                  {typeof app.logo === "string" ? (
                    <img src={app.logo} alt={app.name} width={36} height={36} style={{ borderRadius: 6, objectFit: "contain" }} />
                  ) : (
                    app.logo
                  )}
                </div>
                <div>
                  <div className="text-[14px] font-semibold" style={{ color: "var(--ink-1)" }}>
                    {app.name}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-3)" }}>
                    Supported
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div className="marquee-wrap">
          <div className="marquee-track marquee-right">
            {row2.map((app, i) => (
              <motion.div
                key={`r2-${i}`}
                whileHover={{ scale: 1.06, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex items-center gap-3 px-5 py-4 rounded-xl mx-2 cursor-default select-none transition-colors"
                style={{
                  minWidth: 180,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = app.color;
                  e.currentTarget.style.boxShadow = `0 4px 20px ${app.color}18`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div className="flex-shrink-0">
                  {typeof app.logo === "string" ? (
                    <img src={app.logo} alt={app.name} width={36} height={36} style={{ borderRadius: 6, objectFit: "contain" }} />
                  ) : (
                    app.logo
                  )}
                </div>
                <div>
                  <div className="text-[14px] font-semibold" style={{ color: "var(--ink-1)" }}>
                    {app.name}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-3)" }}>
                    Supported
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-center mt-10"
      >
        <p className="text-[13px] font-medium" style={{ color: "var(--ink-3)" }}>
          …and any platform that lets you export a recording file
        </p>
      </motion.div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────── */
/* AskTraceOverview — Animated typing demo                  */
/* ──────────────────────────────────────────────────────── */

const ASK_QUESTION = "What did Sarah say about the Q3 shipping timeline and what are the current blockers?";
const ASK_ANSWER = "Based on recent meetings, Sarah stated that the Q3 shipping timeline is currently delayed by two weeks.\n\nThe primary blockers identified are:\n• DevOps has not yet provisioned the staging environment for QA testing.\n• The new authentication module is causing unexpected rate-limiting errors on retry paths.";
const ASK_SOURCES = [
  { title: "Q3 Engineering Sync", score: "96%" },
  { title: "Product Roadmap Review", score: "88%" },
];

// Animation phases
const PHASE_TYPING_Q = 0;   // Typing question in input bar
const PHASE_SENT = 1;       // Question appears as chat bubble
const PHASE_THINKING = 2;   // "Thinking" dots
const PHASE_TYPING_A = 3;   // Answer types out
const PHASE_SOURCES = 4;    // Sources fade in
const PHASE_DONE = 5;       // Pause before loop

function AskTraceOverview() {
  const [phase, setPhase] = useState(-1); // -1 = not started
  const [typedQ, setTypedQ] = useState("");
  const [typedA, setTypedA] = useState("");
  const [showSources, setShowSources] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  // Reset all state for a new cycle
  const resetCycle = useCallback(() => {
    setTypedQ("");
    setTypedA("");
    setShowSources(false);
    setPhase(PHASE_TYPING_Q);
  }, []);

  // Start animation when section scrolls into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          resetCycle();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [resetCycle]);

  // Phase: type question character by character
  useEffect(() => {
    if (phase !== PHASE_TYPING_Q) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTypedQ(ASK_QUESTION.slice(0, i));
      if (i >= ASK_QUESTION.length) {
        clearInterval(id);
        setTimeout(() => setPhase(PHASE_SENT), 400);
      }
    }, 35);
    return () => clearInterval(id);
  }, [phase]);

  // Phase: sent → show thinking after brief pause
  useEffect(() => {
    if (phase !== PHASE_SENT) return;
    const id = setTimeout(() => setPhase(PHASE_THINKING), 600);
    return () => clearTimeout(id);
  }, [phase]);

  // Phase: thinking → start typing answer
  useEffect(() => {
    if (phase !== PHASE_THINKING) return;
    const id = setTimeout(() => setPhase(PHASE_TYPING_A), 1500);
    return () => clearTimeout(id);
  }, [phase]);

  // Phase: type answer character by character
  useEffect(() => {
    if (phase !== PHASE_TYPING_A) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTypedA(ASK_ANSWER.slice(0, i));
      if (i >= ASK_ANSWER.length) {
        clearInterval(id);
        setTimeout(() => setPhase(PHASE_SOURCES), 300);
      }
    }, 18);
    return () => clearInterval(id);
  }, [phase]);

  // Phase: show sources → done
  useEffect(() => {
    if (phase !== PHASE_SOURCES) return;
    setShowSources(true);
    const id = setTimeout(() => setPhase(PHASE_DONE), 2000);
    return () => clearTimeout(id);
  }, [phase]);

  // Phase: done → restart loop
  useEffect(() => {
    if (phase !== PHASE_DONE) return;
    const id = setTimeout(() => resetCycle(), 4000);
    return () => clearTimeout(id);
  }, [phase, resetCycle]);

  // Helper: render the answer with formatting
  const renderAnswer = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("• ")) {
        return (
          <div key={i} className="flex items-start gap-2 ml-1" style={{ color: "var(--ink-2)" }}>
            <span className="mt-[2px] flex-shrink-0" style={{ color: "var(--ink-3)" }}>•</span>
            <span>{line.slice(2)}</span>
          </div>
        );
      }
      if (line === "") return <div key={i} className="h-2" />;
      // Bold "two weeks"
      const boldified = line.replace(
        "two weeks",
        "<strong>two weeks</strong>"
      );
      return <div key={i} dangerouslySetInnerHTML={{ __html: boldified }} />;
    });
  };

  const showQuestion = phase >= PHASE_SENT;
  const showThinking = phase === PHASE_THINKING;
  const showAnswer = phase >= PHASE_TYPING_A;

  return (
    <section ref={sectionRef} className="px-6 py-24" style={{ background: "var(--white)" }}>
      <SectionHeader
        eyebrow="Conversational Memory"
        title="Chat with your entire meeting history"
        sub="Don't spend hours scrubbing through recordings. Ask Trace directly."
      />
      <div className="mx-auto" style={{ maxWidth: 760 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="rounded-[20px] p-6 md:p-10"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", minHeight: 420 }}
        >
          <div className="flex flex-col gap-6">

            {/* User Message (appears after typing finishes) */}
            <AnimatePresence>
              {showQuestion && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="self-end max-w-[85%] sm:max-w-[70%]"
                >
                  <div
                    className="px-5 py-3.5 rounded-2xl rounded-tr-sm text-[14px] leading-[1.6] shadow-sm"
                    style={{ background: "var(--accent)", color: "var(--white)" }}
                  >
                    {ASK_QUESTION}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Thinking Indicator */}
            <AnimatePresence>
              {showThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="self-start"
                >
                  <div className="flex gap-3 px-1">
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-full"
                      style={{ width: 28, height: 28, background: "var(--ink-1)", color: "var(--white)" }}
                    >
                      <WaveformIcon size={14} />
                    </div>
                    <div
                      className="px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm bg-white flex items-center gap-1.5"
                      style={{ border: "1px solid var(--border)" }}
                    >
                      {[0, 1, 2].map((dot) => (
                        <motion.span
                          key={dot}
                          className="inline-block rounded-full"
                          style={{ width: 7, height: 7, background: "var(--ink-4)" }}
                          animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: dot * 0.2,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Trace Response (types out) */}
            <AnimatePresence>
              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="self-start max-w-[90%] sm:max-w-[80%]"
                >
                  <div className="flex gap-3 mb-2 px-1">
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-full mt-1"
                      style={{ width: 28, height: 28, background: "var(--ink-1)", color: "var(--white)" }}
                    >
                      <WaveformIcon size={14} />
                    </div>
                    <div>
                      <div
                        className="px-5 py-4 rounded-2xl rounded-tl-sm text-[14px] leading-[1.65] shadow-sm bg-white"
                        style={{ border: "1px solid var(--border)", color: "var(--ink-1)" }}
                      >
                        {renderAnswer(typedA)}
                        {/* Blinking cursor while typing */}
                        {phase === PHASE_TYPING_A && (
                          <motion.span
                            className="inline-block ml-0.5"
                            style={{ width: 2, height: 16, background: "var(--ink-1)", verticalAlign: "text-bottom" }}
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                          />
                        )}
                      </div>

                      {/* Sources */}
                      <AnimatePresence>
                        {showSources && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-wrap gap-2 mt-3 ml-1"
                          >
                            {ASK_SOURCES.map((s) => (
                              <span
                                key={s.title}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
                                style={{ background: "white", border: "1px solid var(--border)", color: "var(--ink-2)" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = "var(--ink-4)";
                                  e.currentTarget.style.color = "var(--ink-1)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = "var(--border)";
                                  e.currentTarget.style.color = "var(--ink-2)";
                                }}
                              >
                                <WaveformIcon size={10} />
                                {s.title}
                                <span style={{ color: "var(--ink-4)" }}>· {s.score}</span>
                              </span>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Bar — shows typing animation in phase 0 */}
            <div
              className="mt-4 pt-4 flex items-center gap-3"
              style={{ borderTop: "1px solid var(--border-mid)" }}
            >
              <div
                className="flex-1 h-12 rounded-full px-5 flex items-center text-[13px]"
                style={{ background: "white", border: "1px solid var(--border)", color: phase === PHASE_TYPING_Q ? "var(--ink-1)" : "var(--ink-4)" }}
              >
                {phase === PHASE_TYPING_Q ? (
                  <>
                    <span>{typedQ}</span>
                    <motion.span
                      className="inline-block ml-0.5"
                      style={{ width: 2, height: 16, background: "var(--ink-1)", verticalAlign: "text-bottom" }}
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.53, repeat: Infinity }}
                    />
                  </>
                ) : (
                  "Ask a follow-up question..."
                )}
              </div>
              <motion.div
                className="flex-shrink-0 flex items-center justify-center rounded-full cursor-pointer"
                style={{ width: 48, height: 48, background: "var(--accent)", color: "var(--white)" }}
                animate={{
                  scale: phase === PHASE_TYPING_Q && typedQ.length === ASK_QUESTION.length ? [1, 1.12, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight size={18} strokeWidth={2} />
              </motion.div>
            </div>

          </div>
        </motion.div>
      </div>
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
    </footer>
  );
}
