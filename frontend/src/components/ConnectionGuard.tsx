import { useEffect, useState } from "react";
import { healthCheck } from "@/lib/api";
import { WaveformIcon } from "./WaveformIcon";

export function ConnectionGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "ok" | "down">("checking");

  const check = async () => {
    try {
      await healthCheck();
      setStatus("ok");
    } catch {
      setStatus("down");
    }
  };

  useEffect(() => {
    check();
    const id = setInterval(() => {
      if (status !== "ok") check();
    }, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status === "ok") return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <WaveformIcon size={48} color="var(--red)" />
        </div>
        <h1 className="text-[22px] font-semibold mb-2" style={{ color: "var(--ink-1)" }}>
          Cannot connect to Trace
        </h1>
        <p className="text-[14px] mb-4" style={{ color: "var(--ink-2)" }}>
          Start the backend with:
        </p>
        <div
          className="font-mono text-[12px] px-4 py-3 rounded-lg border mb-6 text-left"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink-1)" }}
        >
          uvicorn backend.main:app --reload
        </div>
        <button
          onClick={check}
          className="inline-flex items-center h-10 px-5 rounded-md text-[14px] font-semibold text-white"
          style={{ background: "var(--accent)" }}
        >
          Retry connection
        </button>
        {status === "checking" && (
          <p className="text-[12px] mt-4" style={{ color: "var(--ink-3)" }}>
            Checking…
          </p>
        )}
      </div>
    </div>
  );
}
