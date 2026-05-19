import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Video, MessageSquare, Settings, LogOut, Bell, Search, Upload } from "lucide-react";
import { WaveformIcon } from "./WaveformIcon";
import { useAuth } from "./AuthProvider";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/meetings", label: "Meetings", icon: Video },
  { to: "/ask", label: "Ask Trace", icon: MessageSquare },
];

export function AppLayout({ children, onUpload }: { children: ReactNode; onUpload?: () => void }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = e.clientX;
      if (newWidth < 180) newWidth = 180;
      if (newWidth > 480) newWidth = 480;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isResizing]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className="flex flex-col bg-white border-r border-[#e5e5e5] z-20 flex-shrink-0 relative transition-none"
        style={{ width: sidebarWidth }}
      >
        {/* Resizer Handle */}
        <div 
          className="absolute top-0 right-[-3px] w-[6px] h-full cursor-col-resize z-30 flex items-center justify-center group"
          onMouseDown={startResizing}
        >
          <div className="w-[2px] h-full transition-colors group-hover:bg-[#111] group-active:bg-[#111]" style={{ background: isResizing ? "#111" : "transparent" }} />
        </div>
        <div className="h-14 flex items-center px-5 border-b border-[#e5e5e5]">
          <Link to="/dashboard" className="flex items-center gap-2">
            <WaveformIcon size={22} />
            <span className="text-[17px] font-semibold tracking-tight text-[#111]">
              Trace
            </span>
          </Link>
        </div>
        
        <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = loc.pathname === item.to || (item.to === "/meetings" && loc.pathname.startsWith("/meetings"));
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors group relative"
                style={{
                  background: active ? "#f4f4f5" : "transparent",
                  color: active ? "#111" : "#555",
                }}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#111]" />
                )}
                <item.icon size={18} strokeWidth={active ? 2 : 1.5} className="group-hover:text-[#111] transition-colors" />
                <span className="text-[14px] font-medium group-hover:text-[#111] transition-colors">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-[#e5e5e5]">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md transition-colors text-[#555] hover:text-[#111] hover:bg-[#f4f4f5]"
          >
            <LogOut size={18} strokeWidth={1.5} />
            <span className="text-[14px] font-medium">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-[#e5e5e5] flex items-center justify-between px-6 z-10 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-sm w-full hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
              <input 
                type="text" 
                placeholder="Search meetings..." 
                className="w-full h-9 bg-[#f4f4f5] border-transparent rounded-full pl-9 pr-4 text-[13px] outline-none focus:ring-2 focus:ring-[#111]/10 focus:bg-white transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[#555] hover:text-[#111] transition-colors relative">
              <Bell size={18} strokeWidth={1.5} />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 border border-white translate-x-1/2 -translate-y-1/2" />
            </button>
            <div className="w-px h-5 bg-[#e5e5e5] mx-1" />
            {onUpload && (
              <button
                onClick={onUpload}
                className="inline-flex items-center gap-1.5 h-8 px-4 rounded-full text-[13px] font-medium transition-colors text-white bg-[#111] hover:bg-[#222]"
              >
                <Upload size={14} strokeWidth={2} />
                Upload
              </button>
            )}
            {user && (
              <div className="w-8 h-8 rounded-full bg-[#f4f4f5] flex items-center justify-center text-[13px] font-semibold text-[#111] uppercase select-none border border-[#e5e5e5]">
                {user.full_name ? user.full_name[0] : user.email[0]}
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
