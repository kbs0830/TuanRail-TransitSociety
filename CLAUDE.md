# CLAUDE.md — 团‧鐵道

Flask + Jinja2 網站，後端提供 API 與頁面路由，前端使用 vanilla JS（ES modules）與模組化 CSS。

## 架構速覽

```
backend/
  app.py          Flask 工廠函式（context processor、hooks、errorhandler）
  config.py       AppConfig dataclass，從環境變數讀取
  content.py      網站靜態內容資料（SITE_INFO、EPISODES、MEMBERS、EVENTS）
  routes/
    api.py        /api/* 端點
    pages.py      頁面路由（/、/activities、/partners）
    system.py     /robots.txt、/sitemap.xml
    admin.py      /admin/* 後台

frontend/
  templates/
    base.html     基底模板（favicon、字體、CSS、skip-link）
    index.html    首頁（繼承 base.html）
  static/
    css/index.css               CSS 主入口（@import 各模組，共 7 層）
    css/base/                   variables、reset、typography
    css/layout/                 sidebar、main-content、footer
    css/components/             cards、buttons、forms、loader、org、timeline、widgets、sidebar-rail-minimal
    css/features/               home-rebuild、home-rebuild-hero、home-rebuild-sections
                                hero、rail-elements、animations、admin、announcements、route-map
    css/responsive/             mobile（≤768px）
    js/app.js                   JS 主入口
    js/config.js                常數（sectionIds、tinyTips）
    js/api/api-client.js        fetch 封裝
    js/api/api-utils.js         工具函式
    js/modules/                 drawer、renderer、people-renderer、home-controller
                                scroll、episode、train-board、station-clock、dom-utils
```

## 啟動

```bash
pip install -r requirements.txt
python app.py          # http://127.0.0.1:8080
```

## 環境變數（.env，參考 .env.example）

| 變數 | 說明 |
|---|---|
| `SITE_URL` | 正式域名，結尾不加 /（用於 og:url、canonical、Schema.org） |
| `SECRET_KEY` | Flask session 金鑰 |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | 後台登入 |
| `RENDER_API_KEY` / `RENDER_SERVICE_ID` | Render logs 同步 |

`SITE_URL` 未設定時，自動 fallback 為 `request.url_root`（context processor 處理）。

## Jinja2 全域變數

| 變數 | 說明 |
|---|---|
| `static_url('path')` | 帶版本號的靜態資源 URL |
| `site_url` | 正式域名字串（無結尾 /） |

## 常見任務查詢

| 要改什麼 | 去哪裡改 |
|---|---|
| 文字內容（Q&A、成員、理念、歷史） | `backend/content.py` |
| 首頁 HTML 結構 | `frontend/templates/index.html` |
| 全站 `<head>`、favicon、字體 | `frontend/templates/base.html` |
| 主色、字體、間距、陰影、路線色變數 | `frontend/static/css/base/variables.css` |
| 首頁整體版型（body、grid、card 動畫） | `frontend/static/css/features/home-rebuild.css` |
| 英雄區（rail-hero、manifesto、mission、flip-board） | `frontend/static/css/features/home-rebuild-hero.css` |
| 任務支柱、support-links、footer | `frontend/static/css/features/home-rebuild-sections.css` |
| 英雄區 CTA、公告文章 | `frontend/static/css/features/hero.css` |
| 翻牌時鐘、站板、月台徽章、路線色條、側邊欄路線圖 | `frontend/static/css/features/rail-elements.css` |
| 公告橫幅樣式 | `frontend/static/css/features/announcements.css` |
| 路線圖樣式 | `frontend/static/css/features/route-map.css` |
| 卡片（.card、.member-card、.qa-item 等） | `frontend/static/css/components/cards.css` |
| 組織/團隊卡片 | `frontend/static/css/components/org.css` |
| 時間軸 | `frontend/static/css/components/timeline.css` |
| 小部件提示（tiny-note-widget） | `frontend/static/css/components/widgets.css` |
| 側邊欄鐵道簡約風格 | `frontend/static/css/components/sidebar-rail-minimal.css` |
| 側邊欄基礎版型 | `frontend/static/css/layout/sidebar.css` |
| 手機適配 | `frontend/static/css/responsive/mobile.css` |
| API 新增端點 | `backend/routes/api.py` |
| 新增頁面路由 | `backend/routes/pages.py` + 對應 template |
| 成員／活動渲染 | `frontend/static/js/modules/people-renderer.js` |
| 內容片段渲染（keywords、QA、timeline 等） | `frontend/static/js/modules/renderer.js` |
| 首頁資料協調 | `frontend/static/js/modules/home-controller.js` |
| 翻牌顯示器 | `frontend/static/js/modules/train-board.js` |
| 翻牌時鐘（Split-Flap） | `frontend/static/js/modules/station-clock.js` |
| 抽屜選單開關邏輯 | `frontend/static/js/modules/drawer.js` |

## 設計規範

- **不加不必要的功能**：修 bug 不需要重構周邊；不為假設性需求設計抽象。
- **不加不必要的 comment**：只在 WHY 不明顯時才加，不說明 WHAT。
- **CSS 改動**：找對應模組檔案改，不要直接寫進 `index.css`。
- **靜態資源**：永遠用 `static_url('...')` 取 URL，確保快取 busting。
- **內容資料**：文字一律放 `content.py`，template 只做呈現。

## CSS 關鍵架構規則

**`data-platform` 屬性**：首頁各 `<section class="card">` 帶 `data-platform="1~8"`，`rail-elements.css` 用 `attr()` 顯示月台號碼徽章、用屬性選擇器套用路線色頂部條。新增 section 需補此屬性。

**路線色**：統一定義在 `variables.css`（`--tra-blue`、`--mrt-*`、`--platform-gold` 等），`rail-elements.css` 引用。不要在別處硬寫路線色 hex。

**CSS 載入順序**：`rail-elements.css` 在最後載入（layer 7），會覆蓋前面層的同類選擇器，這是刻意設計。

**`card::after` 衝突**：`home-rebuild.css` 將 `.home-rebuild .card::after` 清零（`width:0; height:0; opacity:0`），`rail-elements.css` 的 `.home-rebuild .card[data-platform]::after` 則補上 `width:auto; height:auto; opacity:1` 完全自給自足，兩者不互相干擾。

**卡片設計方向（v9 電馭鐵道）**：全深色主題。主 `.card` 背景 `rgba(18,22,36,0.88)` + 藍色調邊框 `rgba(61,130,255,0.16)` + 藍色光暈陰影。hover 時邊框升亮至 `rgba(61,130,255,0.38)` 並有強烈藍色外發光 `0 0 70px rgba(61,130,255,0.14)`。card 內子元件（mission-pillars、pillar-item 等）用 `rgba(20,24,38,0.75)` 深色背景。

**Hero 標題**：`clamp(4rem, 7.5vw, 9rem)`，漸層色 white→#5ab5ff→amber，`filter: drop-shadow` 霓虹藍發光。

**背景格線**：`body.home-rebuild` 使用 `repeating-linear-gradient` 80px 藍色網格紋路疊在主背景上（電馭叛客風格）。

**頂部色條**：`rail-elements.css` 的 `[data-platform]::before` 帶 `topBarPulse` 4s 呼吸動畫。

**新增 CSS 變數**：`--neon-cyan: #00d4ff`、`--neon-green: #00ff88`。

**新增 HTML 元素**：`.hero-stamp` 內加 `.stamp-type`（`TYP.TR-2026` 機械代碼），`.intro-identity-text` 內加 `.hero-station-code`（`STATION·TW·2026`）。
