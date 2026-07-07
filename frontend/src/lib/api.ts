import axios, { AxiosError } from "axios";

export const API_BASE = import.meta.env.VITE_API_URL;

export const api = axios.create({ baseURL: API_BASE, timeout: 30000 });

export interface ActionItem {
  task: string;
  owner: string | null;
  deadline: string | null;
  assigned_by: string | null;
}
export interface Decision {
  decision: string;
  made_by: string | null;
}
export interface Blocker {
  blocker: string;
  raised_by: string | null;
}
export interface Meeting {
  id: string;
  title: string;
  type: string;
  created_at: string;
  duration: number;
  speakers: string[];
  action_items: ActionItem[];
  decisions: Decision[];
  blockers: Blocker[];
  summary: string;
  key_topics: string[];
  status: "processing" | "complete" | "failed";
}
export interface TranscriptSegment {
  speaker: string;
  text: string;
  start: number;
  end: number;
}
export interface QueryResult {
  text: string;
  meeting_title: string;
  meeting_type: string;
  relevance_score: number;
  type: "action_item" | "decision" | "blocker" | "transcript";
}
export interface QueryResponse {
  answer: string;
  confidence: "high" | "medium" | "low";
  results: QueryResult[];
  sources: { meeting_title?: string; meeting_type?: string; relevance_score?: number; text?: string }[];
  filter_type: string | null;
}
export interface JobStatus {
  job_id: string;
  status: "pending" | "processing" | "complete" | "failed";
  progress: number;
  step: string;
  meeting_id: string | null;
  error: string | null;
}

// ── Backend response types (raw shapes from FastAPI) ──────
interface BackendMeetingSummary {
  meeting_id: string;
  title: string;
  meeting_type: string;
  created_at: string;
  duration_sec: number;
  speakers: string[];
  action_items: number | ActionItem[];
  decisions: number | Decision[];
  blockers: number | Blocker[];
}

interface BackendMeetingDetail {
  meeting_id: string;
  title: string;
  meeting_type: string;
  created_at: string;
  duration_sec: number;
  speakers: string[];
  action_items: ActionItem[];
  decisions: Decision[];
  blockers: Blocker[];
  summary?: string;
  key_topics?: string[];
}

interface BackendJobStatus {
  job_id: string;
  meeting_id: string;
  filename: string;
  status: "queued" | "converting" | "transcribing" | "extracting" | "indexing" | "completed" | "failed";
  progress: number;
  created_at: string;
  error: string | null;
}

// ── Mappers ───────────────────────────────────────────────

function mapMeetingSummary(raw: BackendMeetingSummary): Meeting {
  return {
    id: raw.meeting_id,
    title: raw.title || "Untitled Meeting",
    type: raw.meeting_type || "unknown",
    created_at: raw.created_at || "",
    duration: raw.duration_sec || 0,
    speakers: raw.speakers || [],
    action_items: typeof raw.action_items === "number"
      ? Array(raw.action_items).fill({ task: "", owner: null, deadline: null, assigned_by: null })
      : raw.action_items || [],
    decisions: typeof raw.decisions === "number"
      ? Array(raw.decisions).fill({ decision: "", made_by: null })
      : raw.decisions || [],
    blockers: typeof raw.blockers === "number" 
      ? Array(raw.blockers).fill({ blocker: "", raised_by: null })
      : (raw.blockers || []),
    summary: "",
    key_topics: [],
    status: "complete",
  };
}

function mapMeetingDetail(raw: BackendMeetingDetail): Meeting {
  return {
    id: raw.meeting_id,
    title: raw.title || "Untitled Meeting",
    type: raw.meeting_type || "unknown",
    created_at: raw.created_at || "",
    duration: raw.duration_sec || 0,
    speakers: raw.speakers || [],
    action_items: raw.action_items || [],
    decisions: raw.decisions || [],
    blockers: raw.blockers || [],
    summary: raw.summary || "",
    key_topics: raw.key_topics || [],
    status: "complete",
  };
}

const STATUS_MAP: Record<string, JobStatus["status"]> = {
  queued: "pending",
  converting: "processing",
  transcribing: "processing",
  extracting: "processing",
  indexing: "processing",
  completed: "complete",
  failed: "failed",
};

const STEP_MAP: Record<string, string> = {
  queued: "Waiting to start…",
  converting: "Converting audio",
  transcribing: "Transcribing speech",
  extracting: "Extracting insights",
  indexing: "Building search index",
  completed: "Done",
  failed: "Failed",
};

function mapJobStatus(raw: BackendJobStatus): JobStatus {
  return {
    job_id: raw.job_id,
    status: STATUS_MAP[raw.status] || "processing",
    progress: raw.progress,
    step: STEP_MAP[raw.status] || raw.status,
    meeting_id: raw.meeting_id,
    error: raw.error,
  };
}

// ── API helpers ───────────────────────────────────────────

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    const err = e as AxiosError;
    if (!err.response) {
      // network error — retry once
      return await fn();
    }
    throw e;
  }
}

export const healthCheck = () =>
  withRetry(() => api.get("/health").then(() => undefined));

export const getMeetings = () =>
  withRetry(() =>
    api
      .get<{ meetings: BackendMeetingSummary[]; count: number }>("/meetings")
      .then((r) => r.data.meetings.map(mapMeetingSummary))
  );

export const getMeeting = (id: string) =>
  withRetry(() =>
    api.get<BackendMeetingDetail>(`/meetings/${id}`).then((r) => mapMeetingDetail(r.data))
  );

export const getTranscript = (id: string) =>
  withRetry(() =>
    api.get<{ segments: TranscriptSegment[] }>(`/meetings/${id}/transcript`).then((r) => r.data.segments)
  );

export const deleteMeeting = (id: string) =>
  withRetry(() => api.delete(`/meetings/${id}`).then(() => undefined));

export const uploadMeeting = (file: File, diarization_enabled: boolean = false) => {
  const fd = new FormData();
  fd.append("file", file);
  return api
    .post<{ job_id?: string; meeting_id: string; status?: string; message?: string }>(
      `/meetings/upload?diarization_enabled=${diarization_enabled}`,
      fd,
      { headers: { "Content-Type": "multipart/form-data" }, timeout: 60000 }
    )
    .then((r) => r.data);
};

export const getJobStatus = (jobId: string) =>
  withRetry(() =>
    api.get<BackendJobStatus>(`/jobs/${jobId}`).then((r) => mapJobStatus(r.data))
  );

export const queryMeetings = (question: string, filter_type?: string) =>
  api
    .post<QueryResponse>("/query", { question, filter_type: filter_type ?? null })
    .then((r) => {
      const data = r.data;
      // Normalize: backend returns 'sources' for RAG queries, 'results' for filtered queries
      return {
        ...data,
        answer: data.answer ?? "",
        confidence: data.confidence ?? "low",
        results: data.results ?? [],
        sources: data.sources ?? [],
        filter_type: data.filter_type ?? null,
      };
    });

// ── Auth APIs ─────────────────────────────────────────────

export const login = (email: string, password: string) =>
  api.post("/auth/login", { email, password }).then((r) => r.data);

export const signup = (email: string, password: string, full_name: string) =>
  api.post("/auth/signup", { email, password, full_name }).then((r) => r.data);

