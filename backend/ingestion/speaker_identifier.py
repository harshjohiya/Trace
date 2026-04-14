import json
import re
import os
import numpy as np
from pathlib import Path
from typing import Optional
import torch


PROFILES_PATH = Path("data/speaker_profiles.json")


class SpeakerIdentifier:
    """
    Automatically identify speakers using two strategies:

    Strategy 1 — Name mention detection
      Scans transcript for patterns like "Thanks John",
      "Hi Sarah", "John, can you..." and maps the speaker
      label to that name automatically.

    Strategy 2 — Voice profile matching
      On first meeting, unknown speakers get generic names.
      User confirms names once → voice embeddings saved.
      All future meetings auto-match saved voices.
    """

    def __init__(self):
        self.profiles = self._load_profiles()

    # ──────────────────────────────────────────────────────
    # STRATEGY 1: Name mention detection from transcript
    # ──────────────────────────────────────────────────────

    def detect_names_from_transcript(self, segments: list) -> dict:
        """
        Scan transcript for name mentions and map them to
        speaker labels automatically.

        Patterns detected:
          - Direct address:  "Thanks Angela", "Hi Tarek"
          - Role address:    "Angela, could you..."
          - Self-intro:      "I'm Ken", "My name is Maria"
          - Third-person:    "Tarek from HR is joining"

        Returns: {"SPEAKER_00": "Angela", "SPEAKER_01": "Tarek", ...}
        """
        # Collect all speaker labels
        all_speakers = list(set(s["speaker"] for s in segments))

        # Build a map: speaker_label → list of candidate names
        speaker_name_candidates = {sp: {} for sp in all_speakers}

        for i, seg in enumerate(segments):
            speaker = seg["speaker"]
            text    = seg["text"]

            # ── Pattern 1: Direct address to someone ──────
            # "Thanks Angela", "Hi Ken", "Morning everyone"
            direct_patterns = [
                r'\b(?:thanks?|thank you|hi|hello|hey|morning|good morning|'
                r'good afternoon|goodbye|bye)\s*,?\s*([A-Z][a-z]{2,15})\b',
                r'\b([A-Z][a-z]{2,15})\s*,\s*(?:can you|could you|would you|'
                r'please|I need)',
                r'\bover to\s+([A-Z][a-z]{2,15})\b',
                r'\bask\s+([A-Z][a-z]{2,15})\b',
            ]
            for pattern in direct_patterns:
                matches = re.findall(pattern, text)
                for name in matches:
                    if self._is_valid_name(name):
                        # The ADDRESSED person is likely a DIFFERENT speaker
                        # Mark it as a hint for adjacent speakers
                        self._add_candidate(
                            speaker_name_candidates,
                            speaker,
                            name,
                            weight=0.5,   # weaker — could be addressing anyone
                            is_addressee=True,
                            segments=segments,
                            seg_index=i
                        )

            # ── Pattern 2: Self-introduction ──────────────
            # "I'm Angela", "My name is Tarek", "This is Ken"
            self_patterns = [
                r"\bI(?:'m| am)\s+([A-Z][a-z]{2,15})\b",
                r'\bmy name(?:\'s| is)\s+([A-Z][a-z]{2,15})\b',
                r'\bthis is\s+([A-Z][a-z]{2,15})\b',
                r'\bspeaking[,\s]+([A-Z][a-z]{2,15})\b',
            ]
            for pattern in self_patterns:
                matches = re.findall(pattern, text)
                for name in matches:
                    if self._is_valid_name(name):
                        # Strong signal — this speaker IS this name
                        self._add_candidate(
                            speaker_name_candidates,
                            speaker,
                            name,
                            weight=3.0,
                            is_addressee=False,
                            segments=segments,
                            seg_index=i
                        )

            # ── Pattern 3: Third-person introduction ──────
            # "Tarek from HR is joining", "we have Ken and Maria"
            # The INTRODUCER knows the names → map to OTHER speakers
            intro_patterns = [
                r'\b([A-Z][a-z]{2,15})\s+from\s+[A-Z]',
                r'\bwe have\s+(?:our\s+)?([A-Z][a-z]{2,15})',
                r'\bjoining us[,\s]+([A-Z][a-z]{2,15})',
                r'\bintroduce\s+([A-Z][a-z]{2,15})',
                r'\bmeet\s+([A-Z][a-z]{2,15})',
            ]
            for pattern in intro_patterns:
                matches = re.findall(pattern, text)
                for name in matches:
                    if self._is_valid_name(name):
                        self._add_candidate(
                            speaker_name_candidates,
                            speaker,
                            name,
                            weight=1.5,
                            is_addressee=True,
                            segments=segments,
                            seg_index=i
                        )

            # ── Pattern 4: Name response ──────────────────
            # Previous segment addressed "Ken?" → this speaker
            # responding is likely Ken
            if i > 0:
                prev_text    = segments[i - 1]["text"]
                prev_speaker = segments[i - 1]["speaker"]
                if prev_speaker != speaker:
                    # Check if previous segment ended with a name question
                    name_question = re.search(
                        r'\b([A-Z][a-z]{2,15})\s*[?,]?\s*$', prev_text
                    )
                    if name_question:
                        name = name_question.group(1)
                        if self._is_valid_name(name):
                            self._add_candidate(
                                speaker_name_candidates,
                                speaker,
                                name,
                                weight=2.0,
                                is_addressee=False,
                                segments=segments,
                                seg_index=i
                            )

        # Resolve candidates → best name per speaker
        name_map = self._resolve_candidates(
            speaker_name_candidates, all_speakers
        )

        print(f"[SpeakerIdentifier] Auto-detected names: {name_map}")
        return name_map

    def _add_candidate(self, candidates, speaker, name, weight,
                       is_addressee, segments, seg_index):
        """Add a name candidate with a confidence weight."""
        if is_addressee:
            # Find the closest OTHER speaker near this segment
            target = self._find_adjacent_speaker(
                segments, seg_index, speaker
            )
        else:
            target = speaker

        if target and target in candidates:
            candidates[target][name] = (
                candidates[target].get(name, 0) + weight
            )

    def _find_adjacent_speaker(self, segments, idx, exclude_speaker):
        """Find the nearest speaker before/after idx who isn't exclude_speaker."""
        # Look ahead
        for j in range(idx + 1, min(idx + 4, len(segments))):
            if segments[j]["speaker"] != exclude_speaker:
                return segments[j]["speaker"]
        # Look behind
        for j in range(idx - 1, max(idx - 4, -1), -1):
            if segments[j]["speaker"] != exclude_speaker:
                return segments[j]["speaker"]
        return None

    def _is_valid_name(self, name: str) -> bool:
        """Filter out common false positives."""
        stopwords = {
            "The", "This", "That", "There", "They", "Their",
            "What", "When", "Where", "Which", "Who", "Why", "How",
            "And", "But", "For", "Not", "Yes", "Sure", "Good",
            "Great", "Thanks", "Thank", "Please", "Sorry", "Okay",
            "Once", "Also", "Very", "Just", "Have", "Will", "Can",
            "Could", "Would", "Should", "Been", "With", "From",
            "Your", "Our", "You", "Are", "Was", "Were", "Has",
            "Had", "Its", "Does", "Did", "Into", "About", "Here"
        }
        return (
            len(name) >= 3 and
            name not in stopwords and
            name[0].isupper()
        )

    def _resolve_candidates(self, candidates: dict,
                            all_speakers: list) -> dict:
        """
        Convert candidate scores → final name assignments.
        Ensures no two speakers get the same name.
        Uses greedy highest-confidence assignment.
        """
        # Flatten: list of (speaker, name, score)
        all_options = []
        for speaker, name_scores in candidates.items():
            for name, score in name_scores.items():
                all_options.append((score, speaker, name))

        # Sort by confidence descending
        all_options.sort(reverse=True)

        assigned_names    = {}   # speaker → name
        used_names        = set()

        for score, speaker, name in all_options:
            if speaker in assigned_names:
                continue   # already assigned
            if name in used_names:
                continue   # name already taken
            if score < 0.8:
                continue   # too low confidence

            assigned_names[speaker] = name
            used_names.add(name)

        # Unresolved speakers get readable generic labels
        unresolved_count = 1
        for speaker in all_speakers:
            if speaker not in assigned_names:
                assigned_names[speaker] = f"Participant_{unresolved_count}"
                unresolved_count += 1

        return assigned_names

    # ──────────────────────────────────────────────────────
    # STRATEGY 2: Voice profile persistence
    # ──────────────────────────────────────────────────────

    def _load_profiles(self) -> dict:
        """Load saved voice profiles from disk."""
        if PROFILES_PATH.exists():
            with open(PROFILES_PATH, "r") as f:
                return json.load(f)
        return {}

    def save_profile(self, name: str, embedding: list):
        """
        Save a speaker's voice embedding for future matching.
        Called after user confirms a speaker's name.
        """
        PROFILES_PATH.parent.mkdir(parents=True, exist_ok=True)
        self.profiles[name] = {
            "embedding": embedding,
            "created_at": str(Path("").stat) if False else
                          __import__("datetime").datetime.now().isoformat()
        }
        with open(PROFILES_PATH, "w") as f:
            json.dump(self.profiles, f, indent=2)
        print(f"[SpeakerIdentifier] Saved voice profile for: {name}")

    def match_to_profiles(self, embeddings: dict,
                          threshold: float = 0.75) -> dict:
        """
        Match current meeting's speaker embeddings against
        saved profiles using cosine similarity.

        embeddings: {"SPEAKER_00": [0.1, 0.3, ...], ...}
        Returns:    {"SPEAKER_00": "Angela", ...}  for matches above threshold
        """
        if not self.profiles:
            return {}

        matches = {}
        for speaker, emb in embeddings.items():
            best_name  = None
            best_score = 0.0

            emb_arr = np.array(emb)

            for name, profile in self.profiles.items():
                saved_emb = np.array(profile["embedding"])
                # Cosine similarity
                score = float(
                    np.dot(emb_arr, saved_emb) /
                    (np.linalg.norm(emb_arr) *
                     np.linalg.norm(saved_emb) + 1e-9)
                )
                if score > best_score:
                    best_score = score
                    best_name  = name

            if best_score >= threshold:
                matches[speaker] = best_name
                print(f"[SpeakerIdentifier] {speaker} -> {best_name} "
                      f"(similarity: {best_score:.2f})")

        return matches

    # ──────────────────────────────────────────────────────
    # COMBINED: auto-identify with all strategies
    # ──────────────────────────────────────────────────────

    def identify(self, transcript: dict,
                 embeddings: Optional[dict] = None) -> dict:
        """
        Run all identification strategies and return
        the best name map we can produce automatically.

        Priority:
          1. Voice profile match (if embeddings provided)
          2. Name mention detection from transcript
          3. Generic "Participant_N" fallback
        """
        name_map = {}

        # Strategy 1: voice profiles (most reliable)
        if embeddings and self.profiles:
            profile_matches = self.match_to_profiles(embeddings)
            name_map.update(profile_matches)

        # Strategy 2: name mentions from transcript
        mention_map = self.detect_names_from_transcript(
            transcript["segments"]
        )
        # Only fill in speakers not already matched by profiles
        for speaker, name in mention_map.items():
            if speaker not in name_map:
                name_map[speaker] = name

        return name_map