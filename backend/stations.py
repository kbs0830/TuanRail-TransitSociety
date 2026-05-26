import json
from functools import lru_cache
from typing import Dict, List, Optional

from .config import STATION_DATA_PATH


@lru_cache(maxsize=1)
def _load_station_data() -> List[Dict]:
    try:
        with open(STATION_DATA_PATH, "r", encoding="utf-8") as station_file:
            stations = json.load(station_file)
    except Exception:
        return []

    if not isinstance(stations, list):
        return []

    cleaned = []
    for item in stations:
        if not isinstance(item, dict):
            continue

        station_name = item.get("stationName") or item.get("name") or ""
        station_ename = item.get("stationEName") or item.get("ename") or ""
        cleaned.append(
            {
                "stationCode": str(item.get("stationCode") or ""),
                "stationName": str(station_name),
                "stationEName": str(station_ename),
                "stationAddrTw": str(item.get("stationAddrTw") or ""),
                "stationTel": str(item.get("stationTel") or ""),
                "haveBike": str(item.get("haveBike") or ""),
            }
        )

    return cleaned


def load_station_data(limit: Optional[int] = None) -> List[Dict]:
    stations = _load_station_data()
    if limit is not None:
        return stations[:limit]
    return stations
