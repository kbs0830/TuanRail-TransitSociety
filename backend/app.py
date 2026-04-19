import os
import time

from flask import Flask, render_template, request, url_for

from .config import AppConfig, FRONTEND_DIR, PROJECT_ROOT, load_local_env
from .logs import append_admin_log, init_admin_log
from .routes import register_routes


def create_app() -> Flask:
    load_local_env(PROJECT_ROOT / ".env")
    config = AppConfig.from_env()

    app = Flask(
        __name__,
        template_folder=str(FRONTEND_DIR / "templates"),
        static_folder=str(FRONTEND_DIR / "static"),
    )
    app.secret_key = config.secret_key
    app.config.update(
        ADMIN_USERNAME=config.admin_username,
        ADMIN_PASSWORD=config.admin_password,
        RENDER_DASHBOARD_URL=config.render_dashboard_url,
        RENDER_API_BASE_URL=config.render_api_base_url,
        RENDER_API_KEY=config.render_api_key,
        RENDER_SERVICE_ID=config.render_service_id,
        RENDER_OWNER_ID=config.render_owner_id,
        RENDER_LOGS_API_URL=config.render_logs_api_url,
        APP_CONFIG=config,
    )
    app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
    app.config["TEMPLATES_AUTO_RELOAD"] = True

    register_template_helpers(app)
    register_request_hooks(app)
    register_routes(app)
    init_admin_log()

    @app.errorhandler(404)
    def page_not_found(_error):
        append_admin_log("WARN", "http", f"404 Not Found: {request.path}")
        return render_template("404.html"), 404

    return app


def register_template_helpers(app: Flask) -> None:
    def static_versioned_url(filename: str) -> str:
        file_path = FRONTEND_DIR / "static" / filename
        try:
            version = str(int(file_path.stat().st_mtime))
        except OSError:
            version = str(int(time.time()))
        return url_for("static", filename=filename, v=version)

    @app.context_processor
    def inject_static_url_helper():
        return {"static_url": static_versioned_url}


def register_request_hooks(app: Flask) -> None:
    @app.before_request
    def before_each_request():
        request._start_time = time.perf_counter()

    @app.after_request
    def add_headers(response):
        start_time = getattr(request, "_start_time", None)
        duration_ms = 0.0
        if start_time is not None:
            duration_ms = (time.perf_counter() - start_time) * 1000

        path = request.path or ""
        if path.startswith("/static/"):
            response.headers["Cache-Control"] = "no-store, no-cache, max-age=0, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
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


app = create_app()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=True)
