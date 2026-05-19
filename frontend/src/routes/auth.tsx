import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { WaveformIcon } from "@/components/WaveformIcon";
import { login as apiLogin, signup as apiSignup } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await apiLogin(email, password);
        login(res.access_token, res.user);
      } else {
        const res = await apiSignup(email, password, fullName);
        login(res.access_token, res.user);
      }
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero/Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-[#0a0a0a] relative overflow-hidden">
        {/* Subtle glowing blobs */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white blur-[120px]" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-32">
            <WaveformIcon size={28} color="white" />
            <span className="text-2xl font-bold tracking-tight text-white">Trace</span>
          </div>
          
          <div className="max-w-lg">
            <h2 className="text-[44px] font-bold tracking-tight text-white leading-[1.1]">
              Your team's intelligent<br />conversational memory.
            </h2>
            <p className="mt-6 text-[18px] text-[#a3a3a3] leading-[1.6]">
              Upload recordings and let Trace instantly transcribe, identify speakers, and surface critical action items, decisions, and blockers.
            </p>
          </div>
          
          <div className="mt-12 flex gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0a0a0a] overflow-hidden bg-gray-800">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[13px] text-[#a3a3a3] font-medium mt-0.5">Loved by 10,000+ teams</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-[13px] font-medium text-[#525252]">
          © {new Date().getFullYear()} Trace Intelligence Inc.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12 relative">
        <div className="w-full max-w-[380px]">
          <div className="flex justify-center mb-8 lg:hidden">
            <WaveformIcon size={44} color="var(--accent)" />
          </div>
          
          <h1 className="text-[28px] font-bold text-center lg:text-left mb-2 tracking-tight" style={{ color: "var(--ink-1)" }}>
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-[15px] text-center lg:text-left mb-8" style={{ color: "var(--ink-2)" }}>
            {isLogin ? "Sign in to your account to continue" : "Enter your details to get started"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: "var(--ink-1)" }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border text-[14px] transition-all outline-none"
                  style={{ borderColor: "var(--border)", color: "var(--ink-1)", background: "var(--surface)" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-dim)" }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none" }}
                />
              </div>
            )}
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: "var(--ink-1)" }}>Email address</label>
              <input
                type="email"
                required
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-lg border text-[14px] transition-all outline-none"
                style={{ borderColor: "var(--border)", color: "var(--ink-1)", background: "var(--surface)" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-dim)" }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none" }}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-medium" style={{ color: "var(--ink-1)" }}>Password</label>
                {isLogin && (
                  <button type="button" className="text-[12px] font-medium hover:underline" style={{ color: "var(--accent)" }}>
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 rounded-lg border text-[14px] transition-all outline-none"
                style={{ borderColor: "var(--border)", color: "var(--ink-1)", background: "var(--surface)" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-dim)" }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none" }}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg text-white text-[15px] font-semibold flex justify-center items-center mt-6 transition-all hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: "var(--ink-1)" }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                isLogin ? "Sign In" : "Create account"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-[14px]" style={{ color: "var(--ink-2)" }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail("");
                setPassword("");
                setFullName("");
              }}
              className="ml-2 font-semibold hover:underline transition-colors"
              style={{ color: "var(--ink-1)" }}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
