#!/usr/bin/env python3
"""Read-only Eureka OS AI usage collector.

Reads Hermes session telemetry and credential status without exposing secrets.
Provider refreshes only inspect locally cached Hermes auth state; they never send
credentials to a browser or scrape account pages.
"""
from __future__ import annotations

import json
import os
import sqlite3
import tempfile
import time
from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

STATE_DB = Path(os.environ.get("HERMES_STATE_DB", "/hermes/state.db"))
AUTH_FILE = Path(os.environ.get("HERMES_AUTH_FILE", "/hermes/auth.json"))
CACHE_FILE = Path(os.environ.get("USAGE_CACHE_FILE", "/var/lib/eureka-usage/provider-cache.json"))
PROVIDERS = ("openai_api", "anthropic_api", "deepseek", "google_vertex")
COOLDOWN_SECONDS = 60


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def atomically_write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as handle:
        json.dump(value, handle, ensure_ascii=False, separators=(",", ":"))
        handle.flush()
        os.fsync(handle.fileno())
        temp_name = handle.name
    os.replace(temp_name, path)


def load_cache() -> dict[str, dict]:
    try:
        raw = json.loads(CACHE_FILE.read_text(encoding="utf-8"))
        return raw if isinstance(raw, dict) else {}
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def base_provider(provider: str, message: str) -> dict:
    return {"provider": provider, "sourceKind": "unconfigured", "balanceKind": "unknown",
            "remainingPercent": None, "remainingAmountMicros": None, "currency": None,
            "remainingCouponCount": None, "resetsAt": None, "checkedAt": None,
            "expiresAt": None, "sourceUrl": None, "status": "unconfigured", "message": message}


def provider_status(provider: str) -> dict:
    result = base_provider(provider, "공식 잔여량 조회 adapter가 아직 연결되지 않았습니다.")
    try:
        auth = json.loads(AUTH_FILE.read_text(encoding="utf-8"))
        pool = auth.get("credential_pool", {}) if isinstance(auth, dict) else {}
    except (FileNotFoundError, json.JSONDecodeError):
        return result

    if provider == "openai_api":
        entries = pool.get("openai-codex", []) if isinstance(pool, dict) else []
        exhausted = next((entry for entry in entries if isinstance(entry, dict) and entry.get("last_error_reason") == "usage_limit_reached"), None)
        if exhausted:
            reset = exhausted.get("last_error_reset_at")
            reset_iso = datetime.fromtimestamp(reset, timezone.utc).isoformat().replace("+00:00", "Z") if isinstance(reset, (int, float)) else None
            return {**result, "sourceKind": "manual", "balanceKind": "percent", "remainingPercent": 0,
                    "resetsAt": reset_iso, "checkedAt": now_iso(), "status": "available",
                    "message": "Hermes Codex OAuth의 마지막 응답: 사용 한도에 도달했습니다. 이 값은 OpenAI API 청구 잔액과는 별개입니다."}
        if entries:
            return {**result, "sourceKind": "manual", "checkedAt": now_iso(), "status": "unconfigured",
                    "message": "Codex OAuth는 연결되어 있지만, 아직 잔여량 또는 초기화 시각 응답을 받지 못했습니다."}
    mapping = {"deepseek": "deepseek", "google_vertex": "gemini", "anthropic_api": "anthropic"}
    credential_name = mapping.get(provider)
    if credential_name and isinstance(pool, dict) and pool.get(credential_name):
        return {**result, "sourceKind": "manual", "checkedAt": now_iso(),
                "message": "API 자격 증명은 연결되어 있지만, 이 collector에는 공식 잔액 조회 adapter가 아직 없습니다."}
    return result


def provider_for_model(model: str) -> str:
    name = model.lower()
    if "deepseek" in name: return "deepseek"
    if "gemini" in name: return "google_vertex"
    if "claude" in name: return "anthropic_api"
    return "openai_api"


def summary(range_name: str) -> dict:
    days = {"today": 1, "7d": 7, "30d": 30}.get(range_name, 1)
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).timestamp()
    rows: list[tuple] = []
    if STATE_DB.exists():
        with sqlite3.connect(f"file:{STATE_DB}?mode=ro", uri=True) as conn:
            rows = conn.execute("""select model, input_tokens, output_tokens, cache_read_tokens, api_call_count,
                                  coalesce(actual_cost_usd, estimated_cost_usd), started_at
                               from sessions where started_at >= ?""", (cutoff,)).fetchall()
    grouped: dict[tuple[str, str], dict] = {}
    input_tokens = output_tokens = cached = calls = 0
    cost_micros = 0
    for model, inp, out, cache, api_calls, cost, started in rows:
        model = model or "unknown"
        provider = provider_for_model(model)
        key = (provider, model)
        item = grouped.setdefault(key, {"provider": provider, "model": model, "inputTokens": 0, "outputTokens": 0,
                                        "cachedInputTokens": 0, "costMicros": 0, "currency": "USD", "lastEvent": None})
        for value, field in ((inp, "inputTokens"), (out, "outputTokens"), (cache, "cachedInputTokens")):
            amount = int(value or 0); item[field] += amount
        dollars = float(cost or 0); item["costMicros"] += round(dollars * 1_000_000)
        stamp = datetime.fromtimestamp(float(started), timezone.utc).isoformat().replace("+00:00", "Z")
        item["lastEvent"] = max(item["lastEvent"] or stamp, stamp)
        input_tokens += int(inp or 0); output_tokens += int(out or 0); cached += int(cache or 0); calls += int(api_calls or 0); cost_micros += round(dollars * 1_000_000)
    return {"range": range_name, "inputTokens": input_tokens, "outputTokens": output_tokens,
            "totalTokens": input_tokens + output_tokens + cached, "eventCount": calls,
            "costMicros": cost_micros, "currency": "USD", "models": list(grouped.values())}


class Handler(BaseHTTPRequestHandler):
    def send_json(self, status: int, payload: object) -> None:
        encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status); self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store"); self.send_header("Content-Length", str(len(encoded))); self.end_headers(); self.wfile.write(encoded)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/ai-usage/summary":
            value = parse_qs(parsed.query).get("range", ["today"])[0]
            self.send_json(HTTPStatus.OK, summary(value)); return
        if parsed.path == "/api/ai-usage/providers":
            cache = load_cache()
            providers = []
            for item in PROVIDERS:
                cached = cache.get(item)
                providers.append(cached.get("value") if isinstance(cached, dict) and isinstance(cached.get("value"), dict) else base_provider(item, "아직 확인하지 않음"))
            self.send_json(HTTPStatus.OK, {"providers": providers}); return
        self.send_json(HTTPStatus.NOT_FOUND, {"error": "not_found"})

    def do_POST(self) -> None:
        parts = urlparse(self.path).path.split("/")
        if len(parts) != 6 or parts[:4] != ["", "api", "ai-usage", "providers"] or parts[5] != "refresh" or parts[4] not in PROVIDERS:
            self.send_json(HTTPStatus.NOT_FOUND, {"error": "not_found"}); return
        provider = parts[4]; key = self.headers.get("Idempotency-Key", "")
        if not key.startswith(f"usage-{provider}-"):
            self.send_json(HTTPStatus.BAD_REQUEST, {"error": "idempotency_key_required"}); return
        cache = load_cache(); previous = cache.get(provider, {})
        if previous.get("idempotencyKey") == key:
            self.send_json(HTTPStatus.OK, {"provider": previous["value"]}); return
        checked_at = previous.get("checkedAtEpoch", 0)
        if time.time() - checked_at < COOLDOWN_SECONDS:
            self.send_json(HTTPStatus.TOO_MANY_REQUESTS, {"error": "cooldown", "provider": previous.get("value")}); return
        value = provider_status(provider)
        cache[provider] = {"idempotencyKey": key, "checkedAtEpoch": time.time(), "value": value}
        atomically_write_json(CACHE_FILE, cache)
        self.send_json(HTTPStatus.OK, {"provider": value})

    def log_message(self, format: str, *args: object) -> None: pass


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", int(os.environ.get("PORT", "8091"))), Handler).serve_forever()
