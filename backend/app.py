import os
from flask import Flask, Response, jsonify, render_template, request, url_for

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")

app = Flask(
    __name__,
    template_folder=os.path.join(FRONTEND_DIR, "templates"),
    static_folder=os.path.join(FRONTEND_DIR, "static"),
)


SITE_INFO = {
    "name": "团‧鐵道",
    "subtitle": "連動城市與鐵道的團結",
    "quote": "每一條軌道，都是城市的脈絡；每一段公路，都是夢想的延伸。",
    "fb": "https://www.facebook.com/profile.php?id=61578667744188",
}


MEMBERS = [
    {
        "name": "鄭熙",
        "role": "社長",
        "bio": "統籌團隊發展、活動方向與對外溝通，推動鐵道文化的公共參與。",
    },
    {
        "name": "顧問團",
        "role": "顧問群",
        "bio": "提供活動流程、志工訓練與風險控管建議，協助社團穩定成長。",
    },
    {
        "name": "多媒體科",
        "role": "網路傳播暨紀錄片製作",
        "bio": "紀錄社團日常與知識內容，透過影音讓更多人理解運輸文化。",
    },
]


EVENTS = []


EPISODES = {
    "ep1": {
        "slug": "ep1",
        "title": "団•鐵道創社介紹 EP1",
        "author": "団•鐵道社長 鄭熙",
        "status": "published",
        "summary": "团‧鐵道核心思想、創社初心與理念說明。",
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
                {"label": "団", "desc": "代表團結，連結每一位同好"},
                {"label": "鐵", "desc": "象徵鐵路文化與軌道美學"},
                {"label": "道", "desc": "涵蓋公路、公車與城市運輸脈動"},
            ],
            "timeline": [
                {"phase": "2025", "detail": "以 YT 新鐵道知識庫為基礎，累積鐵道與運輸內容。"},
                {"phase": "2026.01", "detail": "啟動團隊重組，確認社團名稱、定位與核心價值。"},
                {"phase": "2026.03", "detail": "完成初期分工，建立活動流程與志工訓練草案。"},
                {"phase": "2026.04", "detail": "正式以 団•鐵道 對外發表，啟動 EP 系列介紹與社群推廣。"},
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
    path = request.path or ""
    if path.startswith("/static/"):
        response.headers["Cache-Control"] = "public, max-age=604800, immutable"
    elif path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
    else:
        response.headers["Cache-Control"] = "no-cache, max-age=0, must-revalidate"
    return response


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/activities")
def activities_page():
    return render_template("activities.html")


@app.route("/partners")
def partners_page():
    return render_template("partners.html")


@app.route("/api/episodes", methods=["GET"])
def api_episodes():
    episode_list = []
    for item in EPISODES.values():
        episode_list.append(
            {
                "slug": item["slug"],
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
    return render_template("404.html"), 404


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=True)
