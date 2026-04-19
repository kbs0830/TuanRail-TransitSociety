from .admin import admin_bp
from .api import api_bp
from .pages import pages_bp
from .system import system_bp


def register_routes(app) -> None:
    app.register_blueprint(pages_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(system_bp)
