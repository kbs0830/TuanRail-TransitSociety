from flask import Blueprint, redirect, render_template, url_for

pages_bp = Blueprint("pages", __name__)


@pages_bp.route("/")
def index():
    return render_template("index.html")


@pages_bp.route("/activities")
def activities_page():
    return render_template("activities.html")


@pages_bp.route("/partners")
def partners_page():
    return render_template("partners.html")


@pages_bp.route("/login")
def login_page():
    return redirect(url_for("admin.admin_portal"))
