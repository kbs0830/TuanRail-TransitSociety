import json
import re
from typing import Dict, List, Tuple
from urllib import error as urllib_error
from urllib import request as urllib_request
from urllib.parse import urlencode

ANSI_ESCAPE_RE = re.compile(r"\x1B\[[0-?]*[ -/]*[@-~]")


def to_log_level(message: str) -> str:
    text = (message or "").lower()
    if "error" in text or "exception" in text or "fatal" in text:
        return "ERROR"
    if "warn" in text:
        return "WARN"
    return "INFO"


def strip_ansi(text: str) -> str:
    return ANSI_ESCAPE_RE.sub("", text or "")


def normalize_render_log_items(payload) -> List[Dict]:
    if isinstance(payload, list):
        entries = payload
    elif isinstance(payload, dict):
        entries = (
            payload.get("logs")
            or payload.get("data")
            or payload.get("items")
            or payload.get("results")
            or []
        )
    else:
        entries = []

    normalized = []
    for item in entries:
        if isinstance(item, str):
            normalized.append({"time": "", "message": item})
            continue

        if not isinstance(item, dict):
            continue

        message = (
            item.get("message")
            or item.get("msg")
            or item.get("text")
            or item.get("log")
            or item.get("line")
            or item.get("entry")
        )
        timestamp = (
            item.get("timestamp")
            or item.get("time")
            or item.get("createdAt")
            or item.get("ts")
            or ""
        )

        if message:
            normalized.append({"time": str(timestamp), "message": str(message)})

    return normalized


def render_api_get_json(url: str, api_key: str) -> dict:
    req = urllib_request.Request(
        url,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json",
            "User-Agent": "TuanRailAdmin/1.0",
        },
    )
    with urllib_request.urlopen(req, timeout=10) as resp:
        raw = resp.read().decode("utf-8", errors="replace")
        return json.loads(raw)


def discover_render_owner_id(config) -> str:
    if config.render_owner_id:
        return config.render_owner_id

    if not config.render_service_id:
        return ""

    service_url = f"{config.render_api_base_url}/services/{config.render_service_id}"
    try:
        payload = render_api_get_json(service_url, config.render_api_key)
        owner_id = payload.get("ownerId")
        if not owner_id and isinstance(payload.get("owner"), dict):
            owner_id = payload["owner"].get("id")
        return str(owner_id or "")
    except Exception:
        return ""


def fetch_render_logs(config, limit: int = 40) -> Tuple[bool, str, List[Dict]]:
    if not config.render_api_key:
        return False, "尚未設定 RENDER_API_KEY，請在專案根目錄 .env 設定後重啟服務。", []

    candidates = []
    if config.render_logs_api_url:
        candidates.append(config.render_logs_api_url)

    owner_id = discover_render_owner_id(config)

    if config.render_service_id:
        q = urlencode({"limit": int(limit)})
        candidates.append(f"{config.render_api_base_url}/services/{config.render_service_id}/logs?{q}")
        candidates.append(f"{config.render_api_base_url}/logs?resource={config.render_service_id}&{q}")
        if owner_id:
            candidates.append(
                f"{config.render_api_base_url}/logs?ownerId={owner_id}&resource={config.render_service_id}&{q}"
            )
            candidates.append(
                f"{config.render_api_base_url}/logs?ownerId={owner_id}&resourceId={config.render_service_id}&{q}"
            )
            candidates.append(
                f"{config.render_api_base_url}/logs?ownerId={owner_id}&serviceId={config.render_service_id}&{q}"
            )

    errors = []

    for api_url in candidates:
        req = urllib_request.Request(
            api_url,
            headers={
                "Authorization": f"Bearer {config.render_api_key}",
                "Accept": "application/json",
                "User-Agent": "TuanRailAdmin/1.0",
            },
        )
        try:
            with urllib_request.urlopen(req, timeout=10) as resp:
                raw = resp.read().decode("utf-8", errors="replace")
                payload = json.loads(raw)
                logs = normalize_render_log_items(payload)
                if logs:
                    return True, f"成功從 Render API 同步 {len(logs)} 筆。", logs
                errors.append(f"{api_url} 回應成功但沒有可解析的 logs")
        except urllib_error.HTTPError as exc:
            body = ""
            try:
                body = exc.read().decode("utf-8", errors="replace")[:240]
            except Exception:
                body = ""
            errors.append(f"{api_url} -> HTTP {exc.code} {body}".strip())
        except urllib_error.URLError as exc:
            errors.append(f"{api_url} -> 網路錯誤: {exc.reason}")
        except Exception as exc:
            errors.append(f"{api_url} -> 解析失敗: {exc}")
            continue

    reason = "；".join(errors[:2]) if errors else "未知錯誤"
    missing = ""
    if not owner_id:
        missing = "（補充：尚未取得 ownerId，可在 .env 設定 RENDER_OWNER_ID）"
    return (
        False,
        (
            "Render logs 同步失敗。請確認 .env 的 RENDER_API_KEY、RENDER_SERVICE_ID、RENDER_LOGS_API_URL。"
            f"{missing} 診斷: {reason}"
        ),
        [],
    )
