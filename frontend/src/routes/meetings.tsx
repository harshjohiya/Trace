import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { AppNavbar } from "@/components/AppNavbar";
import { ConnectionGuard } from "@/components/ConnectionGuard";
import { QuickAskBar } from "@/components/QuickAskBar";
import { SpeakerStack } from "@/components/Speakers";
import { getMeetings, type Meeting } from "@/lib/api";
import {
  formatDate,
  formatDuration,
  typeAccentBorder,
  typeBadgeColors,
} from "@/lib/trace-utils";
import { usePageTitle } from "@/hooks/usePageTitle";

export const Route = createFileRoute("/meetings")({
  head: () => ({ meta: [{ title: "My Meetings — Trace" }] }),
  component: MeetingsListPage,
});

const FILTERS = ["All", "Planning", "Review", "Standup", "Onboarding"] as const;
type Filter = (typeof FILTERS)[number];
type Sort = "newest" | "oldest" | "tasks";

function MeetingsListPage() {
  usePageTitle("My Meetings — Trace");
  const location = useLocation();

  if (location.pathname !== "/meetings") {
    return <Outlet />;
  }

  return (
    <ConnectionGuard>
      <MeetingsList />
    </ConnectionGuard>
  );
}

function MeetingsList() {
  const { data, isLoading } = useQuery({ queryKey: ["meetings"], queryFn: getMeetings });
  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<Sort>("newest");
  const [sortOpen, setSortOpen] = useState(false);

  const meetings = data ?? [];
  const filtered = useMemo(() => {
    let m = meetings;
    if (filter !== "All") m = m.filter((x) => x.type.toLowerCase() === filter.toLowerCase());
    const sorted = [...m].sort((a, b) => {
      if (sort === "newest") return +new Date(b.created_at) - +new Date(a.created_at);
      if (sort === "oldest") return +new Date(a.created_at) - +new Date(b.created_at);
      return (b.action_items?.length ?? 0) - (a.action_items?.length ?? 0);
    });
    return sorted;
  }, [meetings, filter, sort]);

  const sortLabel: Record<Sort, string> = {
    newest: "Newest first",
    oldest: "Oldest first",
    tasks: "Most action items",
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <AppNavbar />
      <div className="mx-auto px-6 py-10" style={{ maxWidth: 1200 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-bold" style={{ color: "var(--ink-1)" }}>
              Meetings
            </h1>
            <span
              className="text-[12px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "var(--surface-2)", color: "var(--ink-2)" }}
            >
              {meetings.length}
            </span>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center h-[34px] px-4 rounded-md text-[13px] font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            Upload recording
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="text-[13px] font-medium h-[30px] px-3.5 rounded-full transition-colors"
                style={{
                  background: filter === f ? "var(--accent)" : "var(--white)",
                  color: filter === f ? "var(--white)" : "var(--ink-2)",
                  border: filter === f ? "1px solid var(--accent)" : "1px solid var(--border)",
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative">
            <button
              onClick={() => setSortOpen((s) => !s)}
              className="inline-flex items-center gap-1.5 h-[30px] px-3 rounded-md text-[13px] font-medium bg-white"
              style={{ border: "1px solid var(--border)", color: "var(--ink-2)" }}
            >
              {sortLabel[sort]}
              <ChevronDown size={14} strokeWidth={1.5} />
            </button>
            {sortOpen && (
              <div
                className="absolute right-0 mt-1 rounded-md bg-white py-1 z-10"
                style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-lift)", minWidth: 180 }}
              >
                {(Object.keys(sortLabel) as Sort[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      setSort(k);
                      setSortOpen(false);
                    }}
                    className="block w-full text-left text-[13px] px-3 py-1.5 hover:bg-[var(--accent-dim)]"
                    style={{ color: sort === k ? "var(--accent)" : "var(--ink-2)" }}
                  >
                    {sortLabel[k]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-20 rounded-xl animate-pulse"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center" style={{ color: "var(--ink-3)" }}>
            <Search size={32} strokeWidth={1.5} className="mx-auto mb-3" />
            <p className="text-[14px]">No meetings match this filter.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((m, i) => (
              <Row key={m.id} m={m} delay={i * 0.04} />
            ))}
          </div>
        )}
      </div>
      <QuickAskBar />
    </div>
  );
}

function Row({ m, delay }: { m: Meeting; delay: number }) {
  const tBadge = typeBadgeColors(m.type);
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Link
        to="/meetings/$id"
        params={{ id: m.id }}
        className="block bg-white rounded-xl px-6 py-5 flex items-center gap-6 transition-shadow"
        style={{
          border: "1px solid var(--border)",
          borderLeft: `3px solid ${typeAccentBorder(m.type)}`,
          boxShadow: hover ? "var(--shadow-lift)" : "none",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold" style={{ color: "var(--ink-1)" }}>
            {m.title}
          </div>
          <div className="mt-1 flex items-center gap-3 text-[13px]" style={{ color: "var(--ink-3)" }}>
            <span>{formatDate(m.created_at)}</span>
            <span>·</span>
            <span>{formatDuration(m.duration)}</span>
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full capitalize"
              style={{ background: tBadge.bg, color: tBadge.text }}
            >
              {m.type}
            </span>
          </div>
          <div className="mt-2">
            <SpeakerStack names={m.speakers ?? []} size={26} />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Pill label={`${m.action_items?.length ?? 0} tasks`} bg="var(--green-dim)" color="var(--green)" />
          <Pill label={`${m.decisions?.length ?? 0} decisions`} bg="var(--blue-dim)" color="var(--blue)" />
          {(m.blockers?.length ?? 0) > 0 && (
            <Pill label={`${m.blockers.length} blockers`} bg="var(--red-dim)" color="var(--red)" />
          )}
          <motion.span
            initial={false}
            animate={{ opacity: hover ? 1 : 0 }}
            className="ml-2 inline-flex items-center h-[30px] px-3 rounded-md text-[13px] font-medium"
            style={{ border: "1px solid var(--accent)", color: "var(--accent)", background: "var(--white)" }}
          >
            Open
          </motion.span>
        </div>
      </Link>
    </motion.div>
  );
}

function Pill({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: bg, color }}>
      {label}
    </span>
  );
}
