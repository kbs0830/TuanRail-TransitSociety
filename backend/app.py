import json
import os
import re
import time
from collections import deque
from datetime import datetime
from urllib import error as urllib_error
from urllib import request as urllib_request
from urllib.parse import urlencode

from flask import Flask, Response, jsonify, redirect, render_template, request, session, url_for

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")


def load_local_env(env_path):
    if not os.path.exists(env_path):
        return

    with open(env_path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")

            if key and key not in os.environ:
                os.environ[key] = value


load_local_env(os.path.join(PROJECT_ROOT, ".env"))

app = Flask(
    __name__,
    template_folder=os.path.join(FRONTEND_DIR, "templates"),
    static_folder=os.path.join(FRONTEND_DIR, "static"),
)
app.secret_key = os.environ.get("SECRET_KEY", "tuan-rail-admin-secret")


ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin")
RENDER_DASHBOARD_URL = "https://dashboard.render.com/web/srv-d7hpcrjbc2fs73dkhuk0/logs?r=1h"
RENDER_API_BASE_URL = os.environ.get("RENDER_API_BASE_URL", "https://api.render.com/v1")
RENDER_API_KEY = os.environ.get("RENDER_API_KEY", "")
RENDER_SERVICE_ID = os.environ.get("RENDER_SERVICE_ID", "srv-d7hpcrjbc2fs73dkhuk0")
RENDER_OWNER_ID = os.environ.get("RENDER_OWNER_ID", "")
RENDER_LOGS_API_URL = os.environ.get("RENDER_LOGS_API_URL", "")

ANSI_ESCAPE_RE = re.compile(r"\x1B\[[0-?]*[ -/]*[@-~]")

ADMIN_LOGS = deque(maxlen=400)


def append_admin_log(level, source, message):
    ADMIN_LOGS.append(
        {
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "level": level,
            "source": source,
            "message": message,
        }
    )


def is_admin_logged_in():
    return bool(session.get("is_admin"))


def _to_log_level(message):
    text = (message or "").lower()
    if "error" in text or "exception" in text or "fatal" in text:
        return "ERROR"
    if "warn" in text:
        return "WARN"
    return "INFO"


def _strip_ansi(text):
    return ANSI_ESCAPE_RE.sub("", text or "")


def _latest_admin_status(logs, source, prefix):
    for item in logs:
        if item.get("source") != source:
            continue
        msg = item.get("message", "")
        if msg.startswith(prefix):
            return f"{item.get('time')}｜{msg}"
    return ""


def _normalize_render_log_items(payload):
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


def _render_api_get_json(url):
    req = urllib_request.Request(
        url,
        headers={
            "Authorization": f"Bearer {RENDER_API_KEY}",
            "Accept": "application/json",
            "User-Agent": "TuanRailAdmin/1.0",
        },
    )
    with urllib_request.urlopen(req, timeout=10) as resp:
        raw = resp.read().decode("utf-8", errors="replace")
        return json.loads(raw)


def _discover_render_owner_id():
    if RENDER_OWNER_ID:
        return RENDER_OWNER_ID

    if not RENDER_SERVICE_ID:
        return ""

    service_url = f"{RENDER_API_BASE_URL}/services/{RENDER_SERVICE_ID}"
    try:
        payload = _render_api_get_json(service_url)
        owner_id = payload.get("ownerId")
        if not owner_id and isinstance(payload.get("owner"), dict):
            owner_id = payload["owner"].get("id")
        return str(owner_id or "")
    except Exception:
        return ""


def fetch_render_logs(limit=40):
    if not RENDER_API_KEY:
        return False, "尚未設定 RENDER_API_KEY，請在專案根目錄 .env 設定後重啟服務。", []

    candidates = []
    if RENDER_LOGS_API_URL:
        candidates.append(RENDER_LOGS_API_URL)

    owner_id = _discover_render_owner_id()

    if RENDER_SERVICE_ID:
        q = urlencode({"limit": int(limit)})
        candidates.append(f"{RENDER_API_BASE_URL}/services/{RENDER_SERVICE_ID}/logs?{q}")
        candidates.append(f"{RENDER_API_BASE_URL}/logs?resource={RENDER_SERVICE_ID}&{q}")
        if owner_id:
            candidates.append(
                f"{RENDER_API_BASE_URL}/logs?ownerId={owner_id}&resource={RENDER_SERVICE_ID}&{q}"
            )
            candidates.append(
                f"{RENDER_API_BASE_URL}/logs?ownerId={owner_id}&resourceId={RENDER_SERVICE_ID}&{q}"
            )
            candidates.append(
                f"{RENDER_API_BASE_URL}/logs?ownerId={owner_id}&serviceId={RENDER_SERVICE_ID}&{q}"
            )

    errors = []

    for api_url in candidates:
        req = urllib_request.Request(
            api_url,
            headers={
                "Authorization": f"Bearer {RENDER_API_KEY}",
                "Accept": "application/json",
                "User-Agent": "TuanRailAdmin/1.0",
            },
        )
        try:
            with urllib_request.urlopen(req, timeout=10) as resp:
                raw = resp.read().decode("utf-8", errors="replace")
                payload = json.loads(raw)
                logs = _normalize_render_log_items(payload)
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
        f"Render logs 同步失敗。請確認 .env 的 RENDER_API_KEY、RENDER_SERVICE_ID、RENDER_LOGS_API_URL。{missing} 診斷: {reason}",
        [],
    )


append_admin_log("INFO", "system", "後台日誌系統啟動")


SITE_INFO = {
    "name": "团‧鐵道",
    "subtitle": "連動城市與鐵道的團結",
    "quote": "每一條軌道，都是城市的脈絡；每一段公路，都是夢想的延伸。",
    "fb": "https://www.facebook.com/profile.php?id=61578667744188",
}


AXES = {
    "tuan": {
        "code": "tuan",
        "label": "団",
        "name": "團結",
        "desc": "社群、協作與公共參與",
    },
    "rail": {
        "code": "rail",
        "label": "鐵",
        "name": "鐵路文化",
        "desc": "鐵道知識、歷史與文化脈絡",
    },
    "transit": {
        "code": "transit",
        "label": "道",
        "name": "道路公共運輸",
        "desc": "公車、公路與城市運輸行動",
    },
}


MEMBERS = [
    {
        "name": "鄭熙",
        "role": "社長",
        "bio": "統籌團隊發展、活動方向與對外溝通，推動鐵道文化的公共參與。",
        "category": "tuan",
    },
    {
        "name": "顧問團",
        "role": "顧問群",
        "bio": "提供活動流程、志工訓練與風險控管建議，協助社團穩定成長。",
        "category": "tuan",
    },
    {
        "name": "多媒體科",
        "role": "網路傳播暨紀錄片製作",
        "bio": "紀錄社團日常與知識內容，透過影音讓更多人理解運輸文化。",
        "category": "rail",
    },
]


EVENTS = []


EPISODES = {
    "ep1": {
        "slug": "ep1",
        "category": "rail",
        "title": "団•鐵道創社介紹",
        "author": "団•鐵道社長 鄭熙",
        "status": "published",
        "summary": "团‧鐵道核心思想、創社初心與理念整理。",
        "lead": [
            "团‧鐵道｜連動城市與鐵道的團結。",
            "歡迎來到「团‧鐵道」！",
            "嗨大家好，我是団•鐵道社長鄭熙。今天想和大家分享我們創社的過程與一路走來的血淚與熱情。",
            "文長慎入，但如果你願意了解我們，我會非常感謝。",
            "我們不是資源最多的團隊，但我們相信，只要方向正確、態度認真，小團隊也能做出被記住的交通文化行動。",
            "這一頁不是華麗的宣傳，而是把我們真正在做的事情，誠實地放在你面前。",
        ],
        "history": {
            "title": "創社史",
            "body": [
                "団•鐵道成立於 2026 年，由 YT 新鐵道知識庫重組而成。創社初衷很簡單：讓更多人能真正走近鐵道與公共運輸。",
                "我們以鐵與道為主題，用知識帶來新視野，用活動帶大家走進鐵道的世界。歡迎加入団•鐵道。",
                "從線上知識整理到線下活動規劃，我們一步步建立社群、擴大參與，讓公共運輸不只是通勤工具，而是可以被理解、被討論、被熱愛的文化。",
            ],
            "keywords": [
                {"label": "団", "desc": "代表團結，連結每一位同好", "category": "tuan"},
                {"label": "鐵", "desc": "象徵鐵路文化與軌道美學", "category": "rail"},
                {"label": "道", "desc": "涵蓋公路、公車與城市運輸脈動", "category": "transit"},
            ],
            "timeline": [
                {"phase": "2025", "detail": "以 YT 新鐵道知識庫為基礎，累積鐵道與運輸內容。"},
                {"phase": "2026.01", "detail": "啟動團隊重組，確認社團名稱、定位與核心價值。"},
                {"phase": "2026.03", "detail": "完成初期分工，建立活動流程與志工訓練草案。"},
                {"phase": "2026.04", "detail": "正式以 団•鐵道 對外發表，啟動社群介紹與推廣。"},
            ],
        },
        "meaning": {
            "title": "關於团‧鐵道的含義",
            "body": [
                "我們是一群對公共運輸充滿熱忱的青少年，因為共同的愛好而相聚。",
                "「团」：代表團結。在公共運輸的世界裡，沒有一個零件或一條路線能獨自運作。我們以團結為名，連結每一位同好。",
                "「鐵」：象徵鐵路。從鋼軌的鏗鏘聲到複雜的調度，我們鑽研軌道運輸的工藝與美學。",
                "「道」：涵蓋公路。無論是穿梭大街小巷的公車，或串聯城鄉的客運路網，都是城市呼吸的一部分。",
                "我們希望打破『鐵道很硬、很難懂』的距離感，用更友善的方式，讓一般人也能看見公共運輸背後的價值。",
            ],
            "principles": [
                {"title": "知識公開", "desc": "把複雜的運輸知識轉成人人看得懂、用得上的內容。"},
                {"title": "實作導向", "desc": "用活動、走讀、座談把知識從螢幕帶回現場。"},
                {"title": "文化連結", "desc": "讓鐵道、公車與城市生活產生真實而長期的對話。"},
            ],
        },
        "qa": [
            {
                "q": "Q1：你有什麼能力可以創立社團？",
                "a": "老實說，我沒有什麼特別能力。但我有勇氣、決心與 400 小時的交通志工經驗。如果因為害怕失敗就停在原地，那永遠不會有開始。跨出第一步，才有成功的可能。",
            },
            {
                "q": "Q2：社團資金怎麼支撐？",
                "a": "經營社團不只花心力，也真的很花錢。目前我們沒有足夠資金，因此近期會規劃募資活動，希望能籌到基本經費，支撐初期營運。",
            },
            {
                "q": "Q3：新社團活動品質會不會很差？",
                "a": "新社團一定會有摸索期，但我們不會讓品質掉下來。我與顧問團隊會在行前給予工作人員充分訓練，確保每一場活動都達到我們心中的標準。",
            },
            {
                "q": "Q4：未來社團規劃？",
                "a": "我們將不定期舉辦與鐵、道相關的活動，例如專開列車、專題座談、交通文化推廣與更貼近鐵道的互動活動。我們希望成為鐵道文化與大眾之間的橋樑。",
            },
            {
                "q": "Q5：近期活動規劃？",
                "a": "近期除了於暑假期間計畫相關專題座談外，9 月第一週的星期六也規劃了一場盛大活動，歡迎大家持續關注後續消息。",
            },
        ],
        "cta": {
            "title": "非常重要",
            "body": "如果你願意支持我們，請追蹤我們、按讚貼文、並分享給你的朋友。讓更多人認識団•鐵道，也希望能在未來的活動中與你相見。",
            "actions": [
                "追蹤粉絲專頁，掌握最新活動消息。",
                "轉分享本頁給對公共運輸有興趣的朋友。",
                "填寫投訴與建議表單，幫我們把內容做得更完整。",
                "若有合作想法，歡迎來信聯繫。",
            ],
        },
    },
}


@app.after_request
def add_headers(response):
    start_time = getattr(request, "_start_time", None)
    duration_ms = 0.0
    if start_time is not None:
        duration_ms = (time.perf_counter() - start_time) * 1000

    path = request.path or ""
    if path.startswith("/static/"):
        response.headers["Cache-Control"] = "public, max-age=604800, immutable"
    elif path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
    else:
        response.headers["Cache-Control"] = "no-cache, max-age=0, must-revalidate"

    if not path.startswith("/static/"):
        append_admin_log(
            "INFO",
            "http",
            f"{request.method} {path} -> {response.status_code} ({duration_ms:.1f}ms)",
        )
    return response


@app.before_request
def before_each_request():
    request._start_time = time.perf_counter()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/activities")
def activities_page():
    return render_template("activities.html")


@app.route("/partners")
def partners_page():
    return render_template("partners.html")


@app.route("/login")
def login_page():
    return redirect(url_for("admin_portal"))


@app.route("/admin")
def admin_portal():
    if is_admin_logged_in():
        return redirect(url_for("admin_logs_page"))
    return render_template("login.html", error_message="")


@app.route("/admin/login", methods=["POST"])
def admin_login():
    username = (request.form.get("username") or "").strip()
    password = request.form.get("password") or ""

    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        session["is_admin"] = True
        session["admin_user"] = username
        append_admin_log("INFO", "auth", f"管理員登入成功: {username}")
        return redirect(url_for("admin_logs_page"))

    append_admin_log("WARN", "auth", f"管理員登入失敗: {username or 'unknown'}")
    return render_template("login.html", error_message="帳號或密碼錯誤，請重新輸入。"), 401


@app.route("/admin/logout", methods=["POST"])
def admin_logout():
    if session.get("admin_user"):
        append_admin_log("INFO", "auth", f"管理員登出: {session.get('admin_user')}")
    session.clear()
    return redirect(url_for("admin_portal"))


@app.route("/admin/logs")
def admin_logs_page():
    if not is_admin_logged_in():
        return redirect(url_for("admin_portal"))

    logs = list(ADMIN_LOGS)
    logs.reverse()

    render_check_status = _latest_admin_status(logs, "render", "Render dashboard 檢查")
    render_sync_status = _latest_admin_status(logs, "render-sync", "Render logs 已同步")

    return render_template(
        "admin_logs.html",
        logs=logs,
        admin_user=session.get("admin_user", "admin"),
        render_dashboard_url=RENDER_DASHBOARD_URL,
        render_sync_ready=bool(RENDER_API_KEY),
        render_service_id=RENDER_SERVICE_ID,
        render_check_status=render_check_status,
        render_sync_status=render_sync_status,
    )


@app.route("/api/admin/render-check", methods=["POST"])
def admin_render_check():
    if not is_admin_logged_in():
        return jsonify({"ok": False, "message": "未授權"}), 401

    req = urllib_request.Request(
        RENDER_DASHBOARD_URL,
        headers={"User-Agent": "TuanRailAdmin/1.0"},
    )

    try:
        with urllib_request.urlopen(req, timeout=8) as resp:
            status_code = getattr(resp, "status", 200)
            append_admin_log(
                "INFO",
                "render",
                f"Render dashboard 檢查成功，HTTP {status_code}",
            )
            return jsonify(
                {
                    "ok": True,
                    "data": {
                        "status": status_code,
                        "url": RENDER_DASHBOARD_URL,
                        "note": "此檢查僅驗證連線可達，無法直接讀取已登入後台內容。",
                    },
                }
            )
    except Exception as exc:
        append_admin_log("ERROR", "render", f"Render dashboard 檢查失敗: {exc}")
        return jsonify({"ok": False, "message": f"檢查失敗: {exc}"}), 502


@app.route("/api/admin/render-sync", methods=["POST"])
def admin_render_sync():
    if not is_admin_logged_in():
        return jsonify({"ok": False, "message": "未授權"}), 401

    ok, message, items = fetch_render_logs(limit=60)
    if not ok:
        append_admin_log("ERROR", "render-sync", message)
        status = 400 if "RENDER_API_KEY" in message else 502
        return jsonify({"ok": False, "message": message}), status

    appended = 0
    for item in items[:50]:
        level = _to_log_level(item.get("message", ""))
        ts = item.get("time") or ""
        text = _strip_ansi(item.get("message") or "")
        line = f"{ts} {text}".strip()
        append_admin_log(level, "render", line)
        appended += 1

    append_admin_log("INFO", "render-sync", f"Render logs 已同步 {appended} 筆")
    return jsonify({"ok": True, "message": f"Render logs 已同步 {appended} 筆", "count": appended})


@app.route("/.well-known/appspecific/com.chrome.devtools.json", methods=["GET"])
def chrome_devtools_probe():
    return Response("{}", mimetype="application/json")


@app.route("/api/episodes", methods=["GET"])
def api_episodes():
    episode_list = []
    for item in EPISODES.values():
        episode_list.append(
            {
                "slug": item["slug"],
                "category": item.get("category", "rail"),
                "title": item["title"],
                "author": item["author"],
                "status": item["status"],
                "summary": item["summary"],
            }
        )

    return jsonify(
        {
            "ok": True,
            "data": {
                "site": SITE_INFO,
                "axes": AXES,
                "episodes": episode_list,
            },
        }
    )


@app.route("/api/episodes/<slug>", methods=["GET"])
def api_episode_detail(slug):
    episode = EPISODES.get(slug)
    if not episode:
        return jsonify({"ok": False, "message": "找不到指定章節"}), 404

    return jsonify(
        {
            "ok": True,
            "data": {
                "site": SITE_INFO,
                "axes": AXES,
                "episode": episode,
            },
        }
    )


@app.route("/api/ep1", methods=["GET"])
def api_ep1_legacy():
    return jsonify(
        {
            "ok": True,
            "data": {
                "site": SITE_INFO,
                "axes": AXES,
                "episode": EPISODES["ep1"],
            },
        }
    )


@app.route("/api/members", methods=["GET"])
def api_members():
    return jsonify(
        {
            "ok": True,
            "data": {
                "axes": AXES,
                "members": MEMBERS,
            },
        }
    )


@app.route("/api/events", methods=["GET"])
def api_events():
    return jsonify(
        {
            "ok": True,
            "data": {
                "axes": AXES,
                "events": EVENTS,
            },
        }
    )


@app.route("/robots.txt", methods=["GET"])
def robots_txt():
    base = request.host_url.rstrip("/")
    content = f"User-agent: *\nAllow: /\nSitemap: {base}/sitemap.xml\n"
    return Response(content, mimetype="text/plain")


@app.route("/sitemap.xml", methods=["GET"])
def sitemap_xml():
    pages = [
        url_for("index", _external=True),
        url_for("activities_page", _external=True),
        url_for("partners_page", _external=True),
        url_for("login_page", _external=True),
    ]

    lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for page in pages:
        lines.append("  <url>")
        lines.append(f"    <loc>{page}</loc>")
        lines.append("  </url>")
    lines.append("</urlset>")

    return Response("\n".join(lines), mimetype="application/xml")


@app.errorhandler(404)
def page_not_found(_error):
    append_admin_log("WARN", "http", f"404 Not Found: {request.path}")
    return render_template("404.html"), 404


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=True)
