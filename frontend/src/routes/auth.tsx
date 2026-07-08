import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { WaveformIcon } from "@/components/WaveformIcon";
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
  const { login, signup, loginWithGoogle, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate({ to: "/dashboard" });
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, fullName);
        toast.success("Account created successfully!");
      }
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      toast.error(err.message || "Google Sign-In failed");
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

            <div className="relative my-4 flex items-center">
              <div className="flex-grow border-t" style={{ borderColor: "var(--border)" }}></div>
              <span className="mx-4 text-xs font-normal" style={{ color: "var(--ink-2)" }}>or</span>
              <div className="flex-grow border-t" style={{ borderColor: "var(--border)" }}></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full h-11 rounded-lg text-[14px] font-semibold flex justify-center items-center gap-2 border transition-all hover:bg-gray-50 outline-none"
              style={{ borderColor: "var(--border)", color: "var(--ink-1)" }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.62 0 3.06.56 4.2 1.66l3.12-3.12C17.43 1.83 14.91 1 12 1 7.24 1 3.23 3.73 1.3 7.73l3.69 2.87C5.9 7.42 8.7 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.45 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.43c-.28 1.48-1.11 2.73-2.35 3.58l3.66 2.84c2.14-1.98 3.39-4.88 3.39-8.55z" />
                <path fill="#FBBC05" d="M5.02 14.86c-.24-.72-.38-1.49-.38-2.3c0-.81.14-1.58.38-2.3L1.33 7.39c-.83 1.67-1.3 3.56-1.3 5.56s.47 3.89 1.3 5.56l3.69-2.65z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.3 0-6.1-2.38-7.01-5.56L1.3 15.63C3.23 19.63 7.24 23 12 23z" />
              </svg>
              Sign in with Google
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
