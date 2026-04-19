from flask import Blueprint, Response, request, url_for

system_bp = Blueprint("system", __name__)


@system_bp.route("/.well-known/appspecific/com.chrome.devtools.json", methods=["GET"])
def chrome_devtools_probe():
    return Response("{}", mimetype="application/json")


@system_bp.route("/robots.txt", methods=["GET"])
def robots_txt():
    base = request.host_url.rstrip("/")
    content = f"User-agent: *\nAllow: /\nSitemap: {base}/sitemap.xml\n"
    return Response(content, mimetype="text/plain")


@system_bp.route("/sitemap.xml", methods=["GET"])
def sitemap_xml():
    pages = [
        url_for("pages.index", _external=True),
        url_for("pages.activities_page", _external=True),
        url_for("pages.partners_page", _external=True),
        url_for("pages.login_page", _external=True),
    ]

    lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for page in pages:
        lines.append("  <url>")
        lines.append(f"    <loc>{page}</loc>")
        lines.append("  </url>")
    lines.append("</urlset>")

    return Response("\n".join(lines), mimetype="application/xml")
