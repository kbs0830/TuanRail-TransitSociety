from dataclasses import dataclass
from pathlib import Path
import os

PROJECT_ROOT = Path(__file__).resolve().parents[1]
FRONTEND_DIR = PROJECT_ROOT / "frontend"
DATA_DIR = PROJECT_ROOT / "backend" / "Data"
STATION_DATA_PATH = DATA_DIR / "車站基本資料集.json"


def load_local_env(env_path: Path) -> None:
    if not env_path.exists():
        return

    with env_path.open("r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")

            if key and key not in os.environ:
                os.environ[key] = value


@dataclass(frozen=True)
class AppConfig:
    secret_key: str
    admin_username: str
    admin_password: str
    render_dashboard_url: str
    render_api_base_url: str
    render_api_key: str
    render_service_id: str
    render_owner_id: str
    render_logs_api_url: str

    @classmethod
    def from_env(cls) -> "AppConfig":
        service_id = os.environ.get("RENDER_SERVICE_ID", "srv-d7hpcrjbc2fs73dkhuk0")
        dashboard_url = os.environ.get("RENDER_DASHBOARD_URL")
        if not dashboard_url:
            dashboard_url = f"https://dashboard.render.com/web/{service_id}/logs?r=1h"

        return cls(
            secret_key=os.environ.get("SECRET_KEY", "tuan-rail-admin-secret"),
            admin_username=os.environ.get("ADMIN_USERNAME", "admin"),
            admin_password=os.environ.get("ADMIN_PASSWORD", "admin"),
            render_dashboard_url=dashboard_url,
            render_api_base_url=os.environ.get("RENDER_API_BASE_URL", "https://api.render.com/v1"),
            render_api_key=os.environ.get("RENDER_API_KEY", ""),
            render_service_id=service_id,
            render_owner_id=os.environ.get("RENDER_OWNER_ID", ""),
            render_logs_api_url=os.environ.get("RENDER_LOGS_API_URL", ""),
        )
