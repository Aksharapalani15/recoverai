"""
RecoverAI - Gemini Explanation Service
========================================
This is the piece that was described in the README but did not yet exist:
an actual call to the Gemini API. The notebook only built prompt strings
(create_recovery_prompt) and printed them -- it never sent them anywhere.

This module sends the prompt to Gemini, asks for structured JSON back, and
caches the result per transaction on disk so:
  - repeated views of the same transaction don't re-spend API quota
  - the dashboard still works (from cache) if the API key is missing/invalid,
    which matters for a live demo

SECURITY: GEMINI_API_KEY is read from the environment only. It is never
sent to, or accepted from, the frontend.
"""

from __future__ import annotations

import json
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
CACHE_PATH = BASE_DIR / "artifacts" / "ai_insights_cache.json"

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")

_client = None
if GEMINI_API_KEY:
    try:
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)
        _client = genai.GenerativeModel(GEMINI_MODEL)
    except Exception:
        _client = None


def gemini_configured() -> bool:
    return _client is not None


def _load_cache() -> dict:
    if CACHE_PATH.exists():
        try:
            return json.loads(CACHE_PATH.read_text())
        except json.JSONDecodeError:
            return {}
    return {}


def _save_cache(cache: dict) -> None:
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(json.dumps(cache, indent=2))


def _build_prompt(row: dict) -> str:
    return f"""
You are RecoverAI, an AI payment recovery assistant.

Transaction details:
- Amount: Rs.{row['amount']:.2f}
- Payment method: {row['payment_method']}
- Merchant category: {row['merchant_category']}
- Failure reason: {row['failure_reason']}
- Attempt number: {row['attempt_number']}
- Previous successful payments: {row['previous_successes']}
- Previous failed payments: {row['previous_failures']}
- Recovery probability: {row['recovery_probability']:.1%}
- Priority: {row['priority']}
- Recommended action: {row['recommended_action']}
- Recommended channel: {row['recommended_channel']}

Return ONLY a JSON object with exactly these keys, no markdown fences, no extra text:
{{
  "why_recoverable": "2-3 sentences explaining why this transaction is likely recoverable, referencing the specific signals above",
  "why_action": "1-2 sentences on why the recommended action fits this failure reason",
  "customer_message": "A short, friendly customer-facing message, under 50 words. Do not blame the customer, do not mention 'recovery probability' or any internal model/ML terms. Clearly suggest the recommended action."
}}
""".strip()


def _fallback_insight(row: dict, error: str | None = None) -> dict:
    reason = row["failure_reason"]
    return {
        "why_recoverable": (
            f"This transaction has a {row['recovery_probability']:.0%} predicted recovery "
            f"probability based on the customer's history ({row['previous_successes']} prior "
            f"successes vs {row['previous_failures']} prior failures) and the failure reason "
            f"'{reason}', which historically recovers at a distinct rate from other failure types."
        ),
        "why_action": f"'{row['recommended_action']}' is the standard playbook response for a {reason.lower()} failure.",
        "customer_message": (
            "We noticed your recent payment didn't go through. "
            f"{row['recommended_action']}, and let us know if you need any help."
        ),
        "source": "fallback_rule_based",
        "error": error,
    }


def get_ai_insight(transaction_id: str, row: dict, refresh: bool = False) -> dict:
    cache = _load_cache()

    if not refresh and transaction_id in cache:
        return cache[transaction_id]

    if not gemini_configured():
        result = _fallback_insight(row, error="GEMINI_API_KEY not configured")
        cache[transaction_id] = result
        _save_cache(cache)
        return result

    try:
        prompt = _build_prompt(row)
        response = _client.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.strip("`")
            if text.lower().startswith("json"):
                text = text[4:]
        parsed = json.loads(text)
        parsed["source"] = "gemini"
        parsed["error"] = None
        cache[transaction_id] = parsed
        _save_cache(cache)
        return parsed
    except Exception as exc:  # noqa: BLE001 - surface any failure as a graceful fallback
        result = _fallback_insight(row, error=str(exc))
        cache[transaction_id] = result
        _save_cache(cache)
        return result
