import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Upload, LogOut } from "lucide-react";
import { WaveformIcon } from "./WaveformIcon";
import { useAuth } from "./AuthProvider";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/meetings", label: "Meetings" },
  { to: "/ask", label: "Ask Trace" },
  { to: "/docs", label: "Docs" },
] as const;

export function AppNavbar({ onUpload }: { onUpload?: () => void }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <header
      className="sticky top-0 z-40 h-14 bg-white border-b flex items-center px-6"
      style={{ borderColor: "var(--border)" }}
    >
      <Link to="/dashboard" className="flex items-center gap-2">
        <WaveformIcon size={20} />
        <span className="text-[16px] font-semibold" style={{ color: "var(--ink-1)" }}>
          Trace
        </span>
      </Link>
      <nav className="flex-1 flex items-center justify-center gap-8">
        {links.map((l) => {
          const active = loc.pathname === l.to || (l.to === "/meetings" && loc.pathname.startsWith("/meetings"));
          return (
            <Link
              key={l.to}
              to={l.to}
              className="relative text-[14px] font-medium transition-colors"
              style={{ color: active ? "var(--accent)" : "var(--ink-2)" }}
            >
              {l.label}
              {active && (
                <span
                  className="absolute left-0 right-0 -bottom-[19px] h-[2px]"
                  style={{ background: "var(--accent)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm font-medium" style={{ color: "var(--ink-2)" }}>
            {user.full_name || user.email}
          </span>
        )}
        <button
          onClick={onUpload}
          className="inline-flex items-center gap-1.5 h-[34px] px-4 rounded-md text-[13px] font-semibold transition-colors text-[var(--white)]"
          style={{ background: "var(--accent)" }}
          onMouseDown={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
          onMouseUp={(e) => (e.currentTarget.style.background = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
        >
          <Upload size={14} strokeWidth={1.5} />
          Upload recording
        </button>
        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center w-[34px] h-[34px] rounded-md transition-colors"
          style={{ background: "var(--surface)", color: "var(--ink-2)", border: "1px solid var(--border)" }}
          title="Log out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
