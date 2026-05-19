import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Layers, CheckCircle, Zap, AlertTriangle, Calendar, Clock } from "lucide-react";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { ConnectionGuard } from "@/components/ConnectionGuard";
import { UploadCard } from "@/components/UploadCard";
import { QuickAskBar } from "@/components/QuickAskBar";
import { SpeakerStack } from "@/components/Speakers";
import { WaveformIcon } from "@/components/WaveformIcon";
import { getMeetings, type Meeting } from "@/lib/api";
import { formatDate, formatDuration, typeBadgeColors } from "@/lib/trace-utils";
import { useCountUp } from "@/hooks/useCountUp";
import { usePageTitle } from "@/hooks/usePageTitle";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Trace" }] }),
  component: DashboardPage,
});

import { AuthGuard } from "@/components/AuthGuard";

function DashboardPage() {
  usePageTitle("Dashboard — Trace");
  return (
    <AuthGuard>
      <ConnectionGuard>
        <Dashboard />
      </ConnectionGuard>
    </AuthGuard>
  );
}

function Dashboard() {
  const uploadRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ["meetings"],
    queryFn: getMeetings,
  });

  const meetings = data ?? [];
  const totals = {
    meetings: meetings.length,
    tasks: meetings.reduce((a, m) => a + (m.action_items?.length ?? 0), 0),
    decisions: meetings.reduce((a, m) => a + (m.decisions?.length ?? 0), 0),
    blockers: meetings.reduce((a, m) => a + (m.blockers?.length ?? 0), 0),
  };

  const scrollToUpload = () =>
    uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <AppLayout onUpload={scrollToUpload}>
      <div className="mx-auto px-6 py-8" style={{ maxWidth: 1200 }}>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl animate-pulse"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              />
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <ZeroState />
        ) : (
          <>
            <Stats totals={totals} />
            <div ref={uploadRef} className="mt-8">
              <UploadCard onDone={() => refetch()} />
            </div>
            <RecentMeetings meetings={meetings.slice(0, 4)} />
          </>
        )}
        {error && meetings.length === 0 && (
          <div className="text-center py-10">
            <p className="text-[14px]" style={{ color: "var(--red)" }}>
              Could not load meetings.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 inline-flex h-10 px-5 items-center rounded-md text-white text-[14px] font-semibold"
              style={{ background: "var(--accent)" }}
            >
              Retry
            </button>
          </div>
        )}
      </div>
      <QuickAskBar />
    </AppLayout>
  );
}

function ZeroState() {
  const { refetch } = useQuery({ queryKey: ["meetings"], queryFn: getMeetings });
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <WaveformIcon size={48} />
      <h1 className="mt-6 text-[24px] font-semibold" style={{ color: "var(--ink-1)" }}>
        Your meeting library is empty
      </h1>
      <p className="mt-2 text-[14px] max-w-md" style={{ color: "var(--ink-2)" }}>
        Upload a recording to get started. Transcription and extraction take two to three minutes.
      </p>
      <div className="mt-8 w-full max-w-2xl">
        <UploadCard onDone={() => refetch()} />
      </div>
    </div>
  );
}

function Stats({ totals }: { totals: { meetings: number; tasks: number; decisions: number; blockers: number } }) {
  const items = [
    { Icon: Layers, color: "var(--accent)", value: totals.meetings, label: "Meetings processed", sub: "Total recordings analyzed" },
    { Icon: CheckCircle, color: "var(--green)", value: totals.tasks, label: "Action items logged", sub: "Across all meetings" },
    { Icon: Zap, color: "var(--blue)", value: totals.decisions, label: "Decisions captured", sub: "Recorded and searchable" },
    {
      Icon: AlertTriangle,
      color: totals.blockers === 0 ? "var(--amber)" : "var(--red)",
      value: totals.blockers,
      label: "Active blockers",
      sub: "Need attention",
    },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}

function StatCard({
  Icon,
  color,
  value,
  label,
  sub,
}: {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
  color: string;
  value: number;
  label: string;
  sub: string;
}) {
  const v = useCountUp(value);
  return (
    <div className="bg-white rounded-xl px-6 py-5" style={{ border: "1px solid var(--border)" }}>
      <Icon size={18} strokeWidth={1.5} style={{ color }} />
      <div className="mt-3 text-[32px] font-bold leading-none" style={{ color: "var(--ink-1)" }}>
        {v}
      </div>
      <div className="mt-2 text-[13px] font-medium" style={{ color: "var(--ink-2)" }}>
        {label}
      </div>
      <div className="text-[12px] mt-0.5" style={{ color: "var(--ink-3)" }}>
        {sub}
      </div>
    </div>
  );
}

function RecentMeetings({ meetings }: { meetings: Meeting[] }) {
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-semibold" style={{ color: "var(--ink-1)" }}>
          Recent meetings
        </h2>
        <Link to="/meetings" className="text-[13px] font-medium" style={{ color: "var(--accent)" }}>
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meetings.map((m, i) => (
          <MeetingCard key={m.id} m={m} delay={i * 0.05} />
        ))}
      </div>
    </div>
  );
}

function MeetingCard({ m, delay }: { m: Meeting; delay?: number }) {
  const [hover, setHover] = useState(false);
  const tBadge = typeBadgeColors(m.type);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Link
        to="/meetings/$id"
        params={{ id: m.id }}
        className="block bg-white rounded-xl p-5 relative transition-all"
        style={{
          border: "1px solid var(--border)",
          boxShadow: hover ? "var(--shadow-lift)" : "var(--shadow-card)",
          transform: hover ? "translateY(-2px)" : "translateY(0)",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="flex items-start justify-between gap-3">
          <h3
            className="text-[14px] font-semibold leading-tight line-clamp-2"
            style={{ color: "var(--ink-1)" }}
          >
            {m.title}
          </h3>
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full capitalize flex-shrink-0"
            style={{ background: tBadge.bg, color: tBadge.text }}
          >
            {m.type}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-[12px]" style={{ color: "var(--ink-3)" }}>
          <span className="inline-flex items-center gap-1">
            <Calendar size={12} strokeWidth={1.5} />
            {formatDate(m.created_at)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} strokeWidth={1.5} />
            {formatDuration(m.duration)}
          </span>
        </div>
        <div className="mt-3">
          <SpeakerStack names={m.speakers ?? []} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill label={`${m.action_items?.length ?? 0} tasks`} bg="var(--green-dim)" color="var(--green)" />
          <Pill label={`${m.decisions?.length ?? 0} decisions`} bg="var(--blue-dim)" color="var(--blue)" />
          {(m.blockers?.length ?? 0) > 0 && (
            <Pill label={`${m.blockers.length} blockers`} bg="var(--red-dim)" color="var(--red)" />
          )}
        </div>
        {hover && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 right-4 text-[13px] font-medium px-3 py-1 rounded-md"
            style={{ border: "1px solid var(--accent)", color: "var(--accent)", background: "var(--white)" }}
          >
            Open meeting
          </motion.div>
        )}
      </Link>
    </motion.div>
  );
}

function Pill({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span
      className="text-[12px] font-medium px-2.5 py-0.5 rounded-full"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}
