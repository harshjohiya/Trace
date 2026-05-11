# ── Extraction prompt templates ──────────────────────────
# These are carefully engineered for meeting transcripts.
# DO NOT simplify — each constraint exists for a reason.

EXTRACTION_SYSTEM_PROMPT = """You are a precise meeting analyst.
Extract ONLY explicitly stated, concrete information.

STRICT RULES:
- Extract ONLY clear, specific commitments — not vague discussions
- An action item MUST have: a specific task AND someone who said
  they would do it (or was explicitly asked to do it)
- A decision MUST be something the group explicitly agreed on —
  not an opinion, suggestion, or possibility
- A blocker MUST be something explicitly preventing work —
  not a general challenge or topic of discussion
- If owner is unknown, use the speaker label (Speaker, John, etc)
- For deadlines use exact phrases said out loud only
- Output ONLY valid JSON. No explanation, no markdown, nothing else.
"""

CHUNK_EXTRACTION_PROMPT = """Extract ONLY concrete, explicit items
from this meeting transcript chunk.

TRANSCRIPT:
{transcript}

STRICT DEFINITIONS:

action_item: Someone EXPLICITLY agreed to do something OR was
explicitly asked and accepted. Must be specific and actionable.

BAD examples (do NOT extract these):
- "we should look into that sometime"
- "it would be good to discuss this"
- "someone needs to think about it"
- "suggest items for the meeting"
- "think about what could be useful"

GOOD examples (extract these):
- "John said he will send the report by Friday"
- "Sarah, can you review the PR? Sure, I'll do it today"
- "I'll set up the meeting for next week"

decision: The group EXPLICITLY agreed or concluded something.
Must be a real conclusion, not a discussion point.

BAD examples (do NOT extract):
- "we talked about increasing hiring"
- "try and invest a bit more in that"
- "it would be nice to do X"

GOOD examples (extract these):
- "we decided to launch on Friday"
- "the team agreed to remove the on-call weekend requirement"
- "we are going with option B"

blocker: Something EXPLICITLY preventing work from starting
or continuing right now.

BAD examples (do NOT extract):
- "it's a bit challenging"
- "we need to think about scaling"
- general topic discussions

GOOD examples (extract these):
- "we cannot proceed until we have access to the tool"
- "blocked on the API rate limit issue"
- "missing the signed document before work can start"

Return ONLY this JSON structure, nothing else:
{{
  "action_items": [
    {{
      "task": "specific concrete task description",
      "owner": "name of person who committed or was assigned",
      "deadline": "exact phrase used or null",
      "mentioned_by": "speaker who assigned or committed"
    }}
  ],
  "decisions": [
    {{
      "decision": "exactly what was decided",
      "made_by": "speaker or Unknown"
    }}
  ],
  "blockers": [
    {{
      "blocker": "what is explicitly blocking progress",
      "affects": "who or what is affected"
    }}
  ],
  "key_topics": [
    "only major topics discussed, max 5"
  ]
}}

Return empty arrays [] if nothing clearly qualifies.
When in doubt — leave it out.
Return ONLY the JSON object, absolutely nothing else."""


AGGREGATION_PROMPT = """Merge these extraction results from
multiple chunks of the same meeting.

CHUNKS DATA:
{chunks_json}

STRICT RULES:
- Keep ONLY concrete, specific items
- Remove anything vague or generic
- Merge duplicates (same task mentioned twice = keep once)
- Remove items where task description is under 8 words
  and sounds like a discussion topic not a commitment
- Remove action items where owner is Unassigned AND
  the task is vague (keep Unassigned only if task is specific)
- Max 10 action items total — keep only the strongest ones
- Max 6 decisions total — keep only clear conclusions
- Max 4 blockers — keep only explicit blockers
- Write a 2-3 sentence summary of what the meeting was about

Return ONLY this JSON, nothing else:
{{
  "action_items": [
    {{
      "task": "specific task",
      "owner": "person or Unassigned",
      "deadline": "deadline phrase or null",
      "mentioned_by": "speaker"
    }}
  ],
  "decisions": [
    {{
      "decision": "what was decided",
      "made_by": "speaker"
    }}
  ],
  "blockers": [
    {{
      "blocker": "explicit blocker",
      "affects": "who affected"
    }}
  ],
  "key_topics": ["topic1", "topic2", "topic3"],
  "summary": "2-3 sentence plain English summary of the meeting"
}}"""


MEETING_TITLE_PROMPT = """Generate a meeting title and type.

SUMMARY: {summary}
TOPICS: {topics}

Return ONLY this JSON:
{{
  "title": "specific meeting title under 8 words",
  "meeting_type": "standup|planning|review|onboarding|discussion"
}}"""