# ── Extraction prompt templates ──────────────────────────
# These are carefully engineered for meeting transcripts.
# DO NOT simplify — each constraint exists for a reason.

EXTRACTION_SYSTEM_PROMPT = """You are a precise meeting analyst.
Your job is to extract structured information from meeting transcripts.

RULES:
- Extract ONLY what is explicitly stated. Never infer or assume.
- For owners: use the exact name mentioned. If unclear, use "Unassigned".
- For deadlines: use exact phrases ("today", "next Friday", "2 weeks").
  If no deadline mentioned, use null.
- For decisions: only include FINAL decisions, not discussions or options.
- Output ONLY valid JSON. No explanation, no markdown, no extra text.
"""

CHUNK_EXTRACTION_PROMPT = """Extract structured data from this meeting transcript chunk.

TRANSCRIPT:
{transcript}

DEFINITIONS (read carefully):
- action_item: any task, request, or follow-up someone needs to do
- decision: something that was AGREED or DECIDED (not just discussed)
- blocker: anything preventing someone from starting work, missing info,
  missing documents, unresolved dependencies, or explicit problems stated
- deadline: ANY time reference near a task — "today", "this afternoon",
  "next week", "in two weeks", "by Friday" ALL count as deadlines

Extract and return ONLY this JSON structure:
{{
  "action_items": [
    {{
      "task": "clear description of what needs to be done",
      "owner": "person responsible or Unassigned",
      "deadline": "exact phrase used or null if truly none mentioned",
      "mentioned_by": "speaker who assigned this task"
    }}
  ],
  "decisions": [
    {{
      "decision": "what was decided",
      "made_by": "speaker who made or announced the decision"
    }}
  ],
  "blockers": [
    {{
      "blocker": "what is blocking progress",
      "affects": "who or what is affected"
    }}
  ],
  "key_topics": [
    "brief topic 1",
    "brief topic 2"
  ]
}}

BLOCKER EXAMPLES — these should ALL be extracted as blockers:
- "I don't think I received it" → blocker: missing document
- "we can't start until..." → blocker: dependency
- "waiting on..." → blocker: waiting dependency
- "you cannot work until I have the signed document" → blocker: unsigned document

Return empty arrays [] only if genuinely nothing found.
Return ONLY the JSON object, absolutely nothing else."""


AGGREGATION_PROMPT = """Merge these extraction results from multiple chunks
of the same meeting into one clean final output.

CHUNKS DATA:
{chunks_json}

RULES:
- Merge duplicates (same task/decision mentioned twice → keep once)
- Preserve ALL owners and deadlines — never drop them
- Keep all unique blockers
- Combine key topics, remove duplicates
- Write a 2-3 sentence summary of the full meeting

Return ONLY this JSON, nothing else:
{{
  "action_items": [
    {{
      "task": "task description",
      "owner": "owner or Unassigned",
      "deadline": "deadline phrase or null",
      "mentioned_by": "speaker"
    }}
  ],
  "decisions": [
    {{
      "decision": "decision description",
      "made_by": "speaker"
    }}
  ],
  "blockers": [
    {{
      "blocker": "blocker description",
      "affects": "who or what is affected"
    }}
  ],
  "key_topics": ["topic1", "topic2"],
  "summary": "2-3 sentence plain English summary of the entire meeting"
}}"""

AGGREGATION_PROMPT = """You are merging extraction results from multiple chunks
of the same meeting transcript into one clean final summary.

CHUNKS DATA:
{chunks_json}

RULES:
- Merge duplicate action items (same task mentioned multiple times → keep once)
- Merge duplicate decisions
- Keep all unique blockers
- Combine all key topics, remove duplicates
- Preserve all owner and deadline information
- If two chunks have the same task with different owners, keep both

Return ONLY this JSON structure, nothing else:
{{
  "action_items": [
    {{
      "task": "task description",
      "owner": "owner name or Unassigned",
      "deadline": "deadline or null",
      "mentioned_by": "speaker"
    }}
  ],
  "decisions": [
    {{
      "decision": "decision description",
      "made_by": "speaker or Unknown"
    }}
  ],
  "blockers": [
    {{
      "blocker": "blocker description",
      "affects": "who/what affected"
    }}
  ],
  "key_topics": ["topic1", "topic2"],
  "summary": "2-3 sentence plain English summary of the entire meeting"
}}"""


MEETING_TITLE_PROMPT = """Given this meeting summary and topics, generate:
1. A short meeting title (max 8 words)
2. The meeting type (standup/planning/onboarding/review/discussion/other)

SUMMARY: {summary}
TOPICS: {topics}

Return ONLY this JSON:
{{
  "title": "meeting title here",
  "meeting_type": "type here"
}}"""