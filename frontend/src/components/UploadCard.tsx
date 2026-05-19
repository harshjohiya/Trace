import { useEffect, useRef, useState } from "react";
import { UploadCloud, X, AlertTriangle } from "lucide-react";
import { uploadMeeting, getJobStatus, type JobStatus } from "@/lib/api";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  "Converting audio",
  "Transcribing speech",
  "Extracting insights",
  "Building search index",
];

export function UploadCard({ onDone }: { onDone?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [job, setJob] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diarizationEnabled, setDiarizationEnabled] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const start = async () => {
    if (!file) return;
    setError(null);
    try {
      const { job_id } = await uploadMeeting(file, diarizationEnabled);
      setJob({ job_id, status: "pending", progress: 0, step: STEPS[0], meeting_id: null, error: null });
      pollRef.current = setInterval(async () => {
        try {
          const s = await getJobStatus(job_id);
          setJob(s);
          if (s.status === "complete" || s.status === "failed") {
            if (pollRef.current) clearInterval(pollRef.current);
            if (s.status === "complete") {
              setTimeout(() => onDone?.(), 1500);
            }
          }
        } catch (e) {
          setError("Lost connection while processing.");
        }
      }, 2000);
    } catch (e) {
      setError("Upload failed.");
    }
  };

  const reset = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setJob(null);
    setFile(null);
    setError(null);
    setDiarizationEnabled(false);
  };

  // Processing view
  if (job && job.status !== "complete") {
    const activeIdx = Math.min(STEPS.length - 1, Math.floor((job.progress / 100) * STEPS.length));
    return (
      <div
        className="bg-white rounded-xl border p-8"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="space-y-4">
          {STEPS.map((s, i) => {
            const state = job.status === "failed" && i === activeIdx ? "failed" : i < activeIdx ? "done" : i === activeIdx ? "active" : "waiting";
            return (
              <div key={s} className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center rounded-full text-[13px] font-semibold"
                  style={{
                    width: 32,
                    height: 32,
                    background: state === "done" ? "var(--green)" : "white",
                    color: state === "done" ? "var(--white)" : state === "active" ? "var(--accent)" : "var(--ink-3)",
                    border:
                      state === "done"
                        ? "1px solid var(--green)"
                        : state === "active"
                          ? "2px solid var(--accent)"
                          : "1px solid var(--border-mid)",
                    animation: state === "active" ? "spin 1.4s linear infinite" : undefined,
                  }}
                >
                  {state === "done" ? "✓" : i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-semibold" style={{ color: state === "waiting" ? "var(--ink-3)" : "var(--ink-1)" }}>
                    {s}
                  </div>
                  {state === "active" && (
                    <div className="text-[13px] mt-0.5" style={{ color: "var(--ink-2)" }}>
                      {job.step || "Working…"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
            <motion.div
              animate={{ width: `${job.progress}%` }}
              transition={{ duration: 0.4 }}
              style={{ background: "var(--accent)", height: "100%" }}
            />
          </div>
          <span className="font-mono text-[12px]" style={{ color: "var(--ink-3)" }}>
            {Math.round(job.progress)}%
          </span>
        </div>
        {error && <p className="mt-3 text-[13px]" style={{ color: "var(--red)" }}>{error}</p>}
      </div>
    );
  }

  if (job && job.status === "complete") {
    return (
      <div className="bg-white rounded-xl border p-8 text-center" style={{ borderColor: "var(--border)" }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400 }}
          className="inline-flex items-center justify-center rounded-full mb-4"
          style={{ width: 48, height: 48, background: "var(--green)" }}
        >
          <span className="text-white text-lg">✓</span>
        </motion.div>
        <h3 className="text-[18px] font-semibold mb-2" style={{ color: "var(--ink-1)" }}>
          Processing complete
        </h3>
        {job.meeting_id && (
          <button
            onClick={() => nav({ to: "/meetings/$id", params: { id: job.meeting_id! } })}
            className="mt-4 inline-flex h-10 items-center px-5 rounded-md text-white text-[14px] font-semibold"
            style={{ background: "var(--accent)" }}
          >
            Open meeting
          </button>
        )}
      </div>
    );
  }

  if (job && job.status === "failed") {
    return (
      <div className="bg-white rounded-xl border p-8 text-center" style={{ borderColor: "var(--red-mid)" }}>
        <div className="text-[18px] font-semibold" style={{ color: "var(--red)" }}>Processing failed</div>
        <p className="text-[13px] mt-2" style={{ color: "var(--ink-2)" }}>{job.error || "Something went wrong."}</p>
        <button onClick={reset} className="mt-4 inline-flex h-10 items-center px-5 rounded-md text-white text-[14px] font-semibold" style={{ background: "var(--accent)" }}>
          Try again
        </button>
      </div>
    );
  }

  // Upload card
  return (
    <div
      className="block bg-white rounded-xl text-center transition-colors relative"
      style={{
        border: `2px dashed ${dragOver ? "var(--accent-mid)" : "var(--border-mid)"}`,
        background: dragOver ? "var(--accent-dim)" : "white",
        padding: 40,
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) setFile(f);
      }}
    >
      <input
        id="meeting-upload"
        type="file"
        className="hidden"
        accept=".mp3,.mp4,.wav,.m4a,.ogg,.flac"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setFile(f);
        }}
      />
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <label htmlFor="meeting-upload" className="cursor-pointer block w-full h-full">
              <UploadCloud size={36} strokeWidth={1.5} style={{ color: "var(--accent)", margin: "0 auto" }} />
              <h3 className="mt-4 text-[16px] font-semibold" style={{ color: "var(--ink-1)" }}>
                Upload a meeting recording
              </h3>
              <p className="text-[13px] mt-1" style={{ color: "var(--ink-3)" }}>
                Drag and drop a file here, or click to browse
              </p>
              <p className="text-[12px] mt-3 font-mono" style={{ color: "var(--ink-4)" }}>
                MP3 · MP4 · WAV · M4A · OGG · FLAC
              </p>
            </label>
          </motion.div>
        ) : (
          <motion.div key="picked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="text-[14px] font-medium" style={{ color: "var(--ink-1)" }}>
              {file.name}
            </div>
            <div className="text-[13px] mt-1" style={{ color: "var(--ink-3)" }}>
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </div>
            
            <div 
              className="mt-6 mx-auto max-w-sm p-5 rounded-xl text-left border" 
              style={{ borderColor: "var(--border-mid)", background: "var(--surface)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-semibold" style={{ color: "var(--ink-1)" }}>Enable Speaker Diarization</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={diarizationEnabled} 
                    onChange={(e) => setDiarizationEnabled(e.target.checked)} 
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" style={{ background: diarizationEnabled ? "var(--accent)" : "var(--border-mid)" }}></div>
                </label>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
                Speaker diarization identifies and separates different speakers in the meeting. This process improves speaker-based transcripts but may increase processing time.
              </p>
              {diarizationEnabled && (
                <div className="mt-3 text-[12px] font-medium flex items-center gap-1.5" style={{ color: "#d97706" }}>
                  <AlertTriangle size={14} /> Diarization may increase processing time.
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  start();
                }}
                className="inline-flex h-10 items-center px-5 rounded-md text-white text-[14px] font-semibold transition-transform active:scale-95"
                style={{ background: "var(--accent)" }}
              >
                Process with Trace
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  reset();
                }}
                className="text-[13px] inline-flex items-center gap-1 hover:opacity-70 transition-opacity"
                style={{ color: "var(--ink-3)" }}
              >
                <X size={14} /> Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
