import axios, { AxiosError } from "axios"
import type {
  ApiClientError,
  DeleteMeetingResponse,
  FilteredQueryResponse,
  HealthResponse,
  JobStatus,
  MeetingExtraction,
  MeetingsResponse,
  MeetingTranscript,
  QueryPayload,
  QueryResponse,
  UploadMeetingResponse,
} from "@/types"

const BASE_URL = "http://localhost:8000"

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

function toApiError(error: unknown): ApiClientError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string; message?: string }>
    if (axiosError.code === "ECONNABORTED") {
      return { message: "Request timed out after 30s.", code: axiosError.code }
    }
    if (!axiosError.response) {
      return { message: "Cannot connect to Trace backend. Check if server is running.", code: "NETWORK_ERROR" }
    }
    const status = axiosError.response.status
    const dataMessage = axiosError.response.data?.detail ?? axiosError.response.data?.message
    if (status === 404) {
      return { message: dataMessage ?? "Requested meeting was not found.", status }
    }
    if (status >= 500) {
      return { message: dataMessage ?? "Trace backend encountered an internal error.", status }
    }
    return {
      message: dataMessage ?? axiosError.message ?? "Unexpected API error.",
      status,
      code: axiosError.code,
    }
  }
  return { message: "Unexpected error while calling Trace API." }
}

function throwApiError(error: unknown): never {
  throw toApiError(error)
}

export async function healthCheck(): Promise<HealthResponse> {
  try {
    const { data } = await client.get<HealthResponse>("/health")
    return data
  } catch (error) {
    throwApiError(error)
  }
}

export async function listMeetings(): Promise<MeetingsResponse> {
  try {
    const { data } = await client.get<MeetingsResponse>("/meetings")
    return data
  } catch (error) {
    throwApiError(error)
  }
}

export async function getMeeting(id: string): Promise<MeetingExtraction> {
  try {
    const { data } = await client.get<MeetingExtraction>(`/meetings/${id}`)
    return data
  } catch (error) {
    throwApiError(error)
  }
}

export async function getMeetingTranscript(id: string): Promise<MeetingTranscript> {
  try {
    const { data } = await client.get<MeetingTranscript>(`/meetings/${id}/transcript`)
    return data
  } catch (error) {
    throwApiError(error)
  }
}

export async function deleteMeeting(id: string): Promise<DeleteMeetingResponse> {
  try {
    const { data } = await client.delete<DeleteMeetingResponse>(`/meetings/${id}`)
    return data
  } catch (error) {
    throwApiError(error)
  }
}

export async function uploadMeeting(file: File): Promise<UploadMeetingResponse> {
  const formData = new FormData()
  formData.append("file", file)
  try {
    const { data } = await client.post<UploadMeetingResponse>("/meetings/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data
  } catch (error) {
    throwApiError(error)
  }
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  try {
    const { data } = await client.get<JobStatus>(`/jobs/${jobId}`)
    return data
  } catch (error) {
    throwApiError(error)
  }
}

export async function queryMeetings(
  payload: QueryPayload,
): Promise<QueryResponse | FilteredQueryResponse> {
  try {
    const { data } = await client.post<QueryResponse | FilteredQueryResponse>("/query", payload)
    return data
  } catch (error) {
    throwApiError(error)
  }
}
