from urllib import request as urllib_request

from flask import Blueprint, current_app, jsonify, redirect, render_template, request, session, url_for

from ..logs import ADMIN_LOGS, append_admin_log, latest_admin_status
from ..render_service import fetch_render_logs, strip_ansi, to_log_level

admin_bp = Blueprint("admin", __name__)


def is_admin_logged_in() -> bool:
    return bool(session.get("is_admin"))


@admin_bp.route("/admin")
def admin_portal():
    if is_admin_logged_in():
        return redirect(url_for("admin.admin_logs_page"))
    return render_template("login.html", error_message="")


@admin_bp.route("/admin/login", methods=["POST"])
def admin_login():
    username = (request.form.get("username") or "").strip()
    password = request.form.get("password") or ""

    admin_username = current_app.config.get("ADMIN_USERNAME", "admin")
    admin_password = current_app.config.get("ADMIN_PASSWORD", "admin")

    if username == admin_username and password == admin_password:
        session["is_admin"] = True
        session["admin_user"] = username
        append_admin_log("INFO", "auth", f"管理員登入成功: {username}")
        return redirect(url_for("admin.admin_logs_page"))

    append_admin_log("WARN", "auth", f"管理員登入失敗: {username or 'unknown'}")
    return render_template("login.html", error_message="帳號或密碼錯誤，請重新輸入。"), 401


@admin_bp.route("/admin/logout", methods=["POST"])
def admin_logout():
    if session.get("admin_user"):
        append_admin_log("INFO", "auth", f"管理員登出: {session.get('admin_user')}")
    session.clear()
    return redirect(url_for("admin.admin_portal"))


@admin_bp.route("/admin/logs")
def admin_logs_page():
    if not is_admin_logged_in():
        return redirect(url_for("admin.admin_portal"))

    logs = list(ADMIN_LOGS)
    logs.reverse()

    render_check_status = latest_admin_status(logs, "render", "Render dashboard 檢查")
    render_sync_status = latest_admin_status(logs, "render-sync", "Render logs 已同步")

    return render_template(
        "admin_logs.html",
        logs=logs,
        admin_user=session.get("admin_user", "admin"),
        render_dashboard_url=current_app.config.get("RENDER_DASHBOARD_URL"),
        render_sync_ready=bool(current_app.config.get("RENDER_API_KEY")),
        render_service_id=current_app.config.get("RENDER_SERVICE_ID"),
        render_check_status=render_check_status,
        render_sync_status=render_sync_status,
    )


@admin_bp.route("/api/admin/render-check", methods=["POST"])
def admin_render_check():
    if not is_admin_logged_in():
        return jsonify({"ok": False, "message": "未授權"}), 401

    config = current_app.config["APP_CONFIG"]
    req = urllib_request.Request(
        config.render_dashboard_url,
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
                        "url": config.render_dashboard_url,
                        "note": "此檢查僅驗證連線可達，無法直接讀取已登入後台內容。",
                    },
                }
            )
    except Exception as exc:
        append_admin_log("ERROR", "render", f"Render dashboard 檢查失敗: {exc}")
        return jsonify({"ok": False, "message": f"檢查失敗: {exc}"}), 502


@admin_bp.route("/api/admin/render-sync", methods=["POST"])
def admin_render_sync():
    if not is_admin_logged_in():
        return jsonify({"ok": False, "message": "未授權"}), 401

    config = current_app.config["APP_CONFIG"]
    ok, message, items = fetch_render_logs(config, limit=60)
    if not ok:
        append_admin_log("ERROR", "render-sync", message)
        status = 400 if "RENDER_API_KEY" in message else 502
        return jsonify({"ok": False, "message": message}), status

    appended = 0
    for item in items[:50]:
        level = to_log_level(item.get("message", ""))
        ts = item.get("time") or ""
        text = strip_ansi(item.get("message") or "")
        line = f"{ts} {text}".strip()
        append_admin_log(level, "render", line)
        appended += 1

    append_admin_log("INFO", "render-sync", f"Render logs 已同步 {appended} 筆")
    return jsonify({"ok": True, "message": f"Render logs 已同步 {appended} 筆", "count": appended})
