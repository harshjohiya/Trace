
import { Link } from "@tanstack/react-router";
import { WaveformIcon } from "./WaveformIcon";

export function LandingNavbar() {
  return (
    <header
      className="sticky top-0 z-40 h-20 flex items-center px-6 md:px-24 w-full"
      style={{
        background: "transparent",
      }}
    >
      <Link to="/" className="flex items-center gap-2">
        <WaveformIcon size={22} color="var(--ink-1)" />
        <span className="text-[20px] font-bold tracking-tight" style={{ color: "var(--ink-1)" }}>
          Trace
        </span>
      </Link>
      
      <nav className="hidden lg:flex flex-1 items-center justify-center gap-8">
        {[
          { href: "#features", label: "Features" },
          { href: "#how-it-works", label: "How it works" },
          { href: "#pricing", label: "Pricing" },
        ].map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="text-[14px] font-medium transition-colors"
            style={{ color: "var(--ink-2)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink-1)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-2)")}
          >
            {l.label}
          </a>
        ))}
      </nav>
      
      <div className="flex items-center gap-6 ml-auto">
        <Link
          to="/dashboard"
          className="text-[14px] font-medium transition-colors"
          style={{ color: "var(--ink-2)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink-1)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-2)")}
        >
          Sign in
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex items-center h-[38px] px-5 rounded-[8px] text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          Get started
        </Link>
      </div>
    </header>
  );
}
