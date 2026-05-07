export interface Meeting {
  meeting_id: string
  title: string
  meeting_type: string
  created_at: string
  duration_sec: number
  speakers: string[]
  action_items: number
  decisions: number
  blockers: number
}

export interface ActionItem {
  task: string
  owner: string
  deadline: string | null
  mentioned_by: string
}

export interface Decision {
  decision: string
  made_by: string
}

export interface Blocker {
  blocker: string
  affects: string
}

export interface MeetingExtraction {
  meeting_id: string
  created_at: string
  title: string
  meeting_type: string
  duration_sec: number
  speakers: string[]
  action_items: ActionItem[]
  decisions: Decision[]
  blockers: Blocker[]
  key_topics: string[]
  summary: string
  metadata: {
    extraction_time_sec: number
    chunks_processed: number
    model_used: string
    segment_count: number
  }
}

export interface TranscriptSegment {
  speaker: string
  text: string
  start: number
  end: number
}

export interface MeetingTranscript {
  meeting_id: string
  created_at: string
  total_duration: number
  speaker_count: number
  segments: TranscriptSegment[]
  full_text: string
}

export interface Source {
  type: string
  meeting_id: string
  score: number
}

export type QueryConfidence = "high" | "medium" | "low"
export type QueryFilterType = "action_item" | "decision" | "blocker"

export interface QueryResponse {
  question: string
  answer: string
  confidence: QueryConfidence
  sources: Source[]
}

export interface SearchResult {
  task?: string
  owner?: string
  deadline?: string | null
  mentioned_by?: string
  decision?: string
  made_by?: string
  blocker?: string
  affects?: string
}

export interface FilteredQueryResponse {
  question: string
  filter_type: QueryFilterType
  results: SearchResult[]
  count: number
}

export type QueryResult = QueryResponse | FilteredQueryResponse

export interface QueryPayload {
  question: string
  filter_type?: QueryFilterType
}

export interface JobStatus {
  job_id: string
  meeting_id: string
  status:
    | "queued"
    | "converting"
    | "transcribing"
    | "extracting"
    | "indexing"
    | "completed"
    | "failed"
  progress: number
  error: string | null
  created_at: string
  completed_at?: string
}

export interface UploadMeetingResponse {
  job_id: string
  meeting_id: string
  status: "queued"
  message: string
}

export interface DeleteMeetingResponse {
  meeting_id: string
  deleted: string[]
  message: string
}

export interface MeetingsResponse {
  meetings: Meeting[]
  count: number
}

export interface HealthResponse {
  status: "ok"
  timestamp: string
}

export interface ApiClientError {
  message: string
  status?: number
  code?: string
}

export interface AuthUser {
  name: string
  email: string
  token: string
  createdAt: string
}
