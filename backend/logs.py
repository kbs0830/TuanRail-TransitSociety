from collections import deque
from datetime import datetime
from typing import Dict, List

ADMIN_LOGS = deque(maxlen=400)


def append_admin_log(level: str, source: str, message: str) -> None:
    ADMIN_LOGS.append(
        {
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "level": level,
            "source": source,
            "message": message,
        }
    )


def latest_admin_status(logs: List[Dict], source: str, prefix: str) -> str:
    for item in logs:
        if item.get("source") != source:
            continue
        message = item.get("message", "")
        if message.startswith(prefix):
            return f"{item.get('time')}｜{message}"
    return ""


def init_admin_log() -> None:
    append_admin_log("INFO", "system", "後台日誌系統啟動")
