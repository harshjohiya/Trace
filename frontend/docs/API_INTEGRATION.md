# Trace — API Integration

## Backend URL
BASE_URL = http://localhost:8000

## All Endpoints

### Health Check
GET /health
Response: { status: "ok", timestamp: string }

### List Meetings
GET /meetings
Response: {
meetings: Meeting[],
count: number
}

### Get Meeting
GET /meetings/:id
Response: MeetingExtraction

### Get Transcript
GET /meetings/:id/transcript
Response: MeetingTranscript

### Delete Meeting
DELETE /meetings/:id
Response: { meeting_id, deleted[], message }

### Upload Meeting
POST /meetings/upload
Body: FormData
field name: "file"
value: audio/video file
Response: {
job_id: string,
meeting_id: string,
status: "queued",
message: string
}

### Poll Job Status
GET /jobs/:job_id
Response: {
job_id: string,
meeting_id: string,
status: "queued"|"converting"|"transcribing"|
"extracting"|"indexing"|"completed"|"failed",
progress: 0-100,
error: string | null,
created_at: string,
completed_at?: string
}

### Query Meetings
POST /query
Body: {
question: string,
filter_type?: "action_item" | "decision" | "blocker"
}
Response (no filter): {
question: string,
answer: string,
confidence: "high" | "medium" | "low",
sources: Source[]
}
Response (with filter): {
question: string,
filter_type: string,
results: SearchResult[],
count: number
}

## TypeScript Interfaces

```typescript
interface Meeting {
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

interface ActionItem {
  task: string
  owner: string
  deadline: string | null
  mentioned_by: string
}

interface Decision {
  decision: string
  made_by: string
}

interface Blocker {
  blocker: string
  affects: string
}

interface MeetingExtraction {
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

interface TranscriptSegment {
  speaker: string
  text: string
  start: number
  end: number
}

interface MeetingTranscript {
  meeting_id: string
  created_at: string
  total_duration: number
  speaker_count: number
  segments: TranscriptSegment[]
  full_text: string
}

interface Source {
  type: string
  meeting_id: string
  score: number
}

interface QueryResponse {
  question: string
  answer: string
  confidence: "high" | "medium" | "low"
  sources: Source[]
}

interface JobStatus {
  job_id: string
  meeting_id: string
  status: string
  progress: number
  error: string | null
  created_at: string
  completed_at?: string
}
```

## Error Handling

Every API call must handle:
  - Network error (backend offline)
  - 404 (meeting not found)
  - 500 (server error)
  - Timeout (> 30s)

Show toast notification for errors.
Show retry button where appropriate.

## Loading States

Every data fetch must show:
  1. Skeleton while loading
  2. Error state with retry on failure
  3. Empty state with action when no data

## Health Check on App Load

Call GET /health when app mounts.
If success: proceed normally.
If fail: show full-page overlay:
  "Cannot connect to Trace backend"
  Show command: uvicorn backend.main:app --reload
  [Retry] button that polls /health every 5s.
  When /health responds: dismiss overlay, proceed.