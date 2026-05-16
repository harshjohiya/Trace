import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { WaveformIcon } from "./WaveformIcon";

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className="sticky top-0 z-40 h-14 flex items-center px-6 transition-colors"
      style={{
        background: scrolled ? "rgba(255,255,255,0.88)" : "var(--white)",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <Link to="/" className="flex items-center gap-2">
        <WaveformIcon size={20} />
        <span className="text-[16px] font-semibold" style={{ color: "var(--ink-1)" }}>
          Trace
        </span>
      </Link>
      <nav className="flex-1 flex items-center justify-center gap-8">
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
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="text-[14px] font-medium"
          style={{ color: "var(--ink-2)" }}
        >
          Sign in
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex items-center h-[34px] px-4 rounded-md text-[13px] font-semibold text-white"
          style={{ background: "var(--accent)" }}
        >
          Get started
        </Link>
      </div>
    </header>
  );
}
