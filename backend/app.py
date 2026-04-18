import os
from flask import Flask, jsonify, render_template

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


EPISODES = {
    "ep1": {
        "slug": "ep1",
        "title": "団•鐵道創社介紹 EP1",
        "author": "団•鐵道社長 鄭熙",
        "status": "published",
        "summary": "創社初心、現況回應與近期行動。",
        "lead": [
            "嗨大家好，我是団•鐵道社長鄭熙。今天想和大家分享我們創社的過程與一路走來的血淚與熱情。",
            "文長慎入，但如果你願意了解我們，我會非常感謝。",
        ],
        "history": {
            "title": "創社史",
            "body": [
                "団•鐵道成立於 2026 年，由 YT 新鐵道知識庫重組而成。創社初衷很簡單：讓更多人能真正走近鐵道與公共運輸。",
                "我們以鐵與道為主題，用知識帶來新視野，用活動帶大家走進鐵道的世界。歡迎加入団•鐵道。",
            ],
            "keywords": [
                {"label": "団", "desc": "團結"},
                {"label": "鐵", "desc": "鐵路文化"},
                {"label": "道", "desc": "道路公共汽車與運輸"},
            ],
        },
        "meaning": {
            "title": "關於团‧鐵道的含義",
            "body": [
                "我們是一群對公共運輸充滿熱忱的青少年，因為共同的愛好而相聚。",
                "在公共運輸的世界裡，沒有一個零件或一條路線能獨自運作，我們以團結為名，連結每一位同好。",
                "從鋼軌的鏗鏘聲到複雜的調度，我們鑽研軌道運輸的工藝與美學，也持續關注城市道路與公車系統的脈動。",
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
        },
    },
    "ep2": {
        "slug": "ep2",
        "title": "団•鐵道創社介紹 EP2",
        "author": "団•鐵道社長 鄭熙",
        "status": "draft",
        "summary": "籌備現場與團隊分工整理。",
        "lead": [
            "EP2 將聚焦在創社之後的第一階段：從想法到行動的落地。",
            "我們會分享籌備現場的真實流程，包含分工、排程與資源調度。",
        ],
        "history": {
            "title": "籌備紀錄",
            "body": [
                "從零開始建立團隊，我們先定義角色，再逐步補齊宣傳、行政與活動執行流程。",
                "每一次會議都在修正方向，目標是讓活動品質與運作節奏同時穩定。",
            ],
            "keywords": [
                {"label": "組", "desc": "組織分工"},
                {"label": "訓", "desc": "工作訓練"},
                {"label": "行", "desc": "行動落地"},
            ],
        },
        "meaning": {
            "title": "EP2 預告",
            "body": [
                "這一集會帶大家看見幕後細節，理解一場活動如何被反覆打磨。",
            ],
        },
        "qa": [
            {
                "q": "Q：什麼時候上線？",
                "a": "目前進入整理階段，完成後會在首頁與粉專同步公告。",
            }
        ],
        "cta": {
            "title": "持續關注",
            "body": "想搶先看到 EP2，歡迎追蹤粉專，我們會第一時間發布更新。",
        },
    },
    "ep3": {
        "slug": "ep3",
        "title": "団•鐵道創社介紹 EP3",
        "author": "団•鐵道社長 鄭熙",
        "status": "draft",
        "summary": "未來活動藍圖與協作邀請。",
        "lead": [
            "EP3 將公開我們下一階段的活動藍圖與合作模式。",
            "希望把鐵道文化從興趣交流，逐步推進到更多公共參與。",
        ],
        "history": {
            "title": "下一步路線",
            "body": [
                "主題活動將朝向專題座談、交通文化推廣與深度互動設計持續發展。",
                "我們也期待與校園、社群或在地團隊建立共創合作。",
            ],
            "keywords": [
                {"label": "橋", "desc": "文化橋樑"},
                {"label": "展", "desc": "長期發展"},
                {"label": "聯", "desc": "跨域連結"},
            ],
        },
        "meaning": {
            "title": "EP3 預告",
            "body": [
                "我們會把願景拆解為可執行的年度節奏，讓熱情變成可持續的行動。",
            ],
        },
        "qa": [
            {
                "q": "Q：可以合作嗎？",
                "a": "歡迎私訊粉專，與我們討論內容合作、活動支援或場域串聯。",
            }
        ],
        "cta": {
            "title": "一起前進",
            "body": "如果你也相信公共運輸文化值得被更多人看見，歡迎與団•鐵道同行。",
        },
    },
}


@app.after_request
def add_headers(response):
    response.headers["Cache-Control"] = "no-store"
    return response


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/episodes", methods=["GET"])
def api_episodes():
    episode_list = []
    for key in ["ep1", "ep2", "ep3"]:
        item = EPISODES[key]
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


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=True)
