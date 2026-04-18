# Tuan Rail & Transit Society

以白色簡約為基底，結合中華復古與歷史感設計語彙，介紹团‧鐵道創社故事與理念的網站。

## 網站英文名稱

- 正式英文名稱: Tuan Rail & Transit Society
- 中文名稱: 团‧鐵道
- 標語: Linking City, Rail, and Transit in Unity

## 專案簡介

本專案採前後端分離架構。

- 後端: Flask API，提供章節內容與頁面服務
- 前端: HTML、CSS、JavaScript 靜態資源與抽屜式導覽
- 後台: 管理員登入、後台日誌、Render logs 同步
- 視覺風格: 白色簡約、中華復古、歷史檔案感

## 城市結構（內容資訊架構）

本網站內容以「City / Rail / Transit」三軸延伸，對應頁面區塊如下：

- 城市層（City）: 首頁前言、社團宗旨、公共運輸文化定位
- 鐵道層（Rail）: 創社史、時間軸、關鍵字與核心脈絡
- 運輸層（Transit）: 理念說明、Q&A、支持與回饋入口
- 組織層: 組織架構圖、旗下團體、成員介紹卡片
- 活動層: 活動區塊目前保留留白，僅顯示提示小元件，待正式公告後補上

此結構目的在於讓使用者從「城市生活」進入，再理解「鐵道與運輸文化」的整體關聯。

## 目前功能

- 完整介紹頁（創社、理念、Q&A、支持）
- 固定左側導覽與手機抽屜選單（手機版已調整展開間距，避免文字被按鈕遮擋）
- 頁內區塊導覽（前言、組織、創社史、理念、Q&A、支持、成員、活動）
- 創社時間軸、理念卡片、支持行動清單
- 返回頂部按鈕與全站平滑滾動
- 首屏加載動畫（載入遮罩與進度條）
- SEO / Open Graph / Organization 結構化資料
- 成員介紹卡片（由 API 提供）
- 活動區塊留白顯示（提供小提示元件）
- 聯絡與回饋入口（FB、投訴表單、服務信箱）
- 後台管理入口（左側導覽最底部）
- 管理員登入（`/admin`）與後台日誌頁（`/admin/logs`）
- Render 連線檢查與 Render logs 同步（後端 API 觸發）
- 後台狀態顯示最近一次同步結果（含時間）

## 介面現況備註

- 左側導覽列 LOGO 已移除（避免小螢幕視覺壓迫）
- 主軸分類快捷按鈕（団/鐵/道）已移除
- 首頁主軸說明卡仍保留，用於表達內容定位

## 專案結構

```text
.
|-- app.py
|-- .env.example
|-- .gitignore
|-- README.md
|-- requirements.txt
|-- backend/
|   |-- __init__.py
|   |-- auth/
|   |   |-- __init__.py
|   |   |-- models.py
|   |   |-- routes.py
|   |   `-- service.py
|   `-- app.py
`-- frontend/
    |-- static/
    |   |-- images/
    |   |   |-- logo.jpg
    |   |   `-- organization-chart.png
    |   |-- css/
    |   |   `-- site.css
    |   `-- js/
    |       `-- site.js
    `-- templates/
      |-- admin_logs.html
      |-- login.html
        |-- index.html
        |-- activities.html
        |-- partners.html
        `-- 404.html
```

    ## 環境變數設定（.env）

    請在專案根目錄建立 `.env`（可參考 `.env.example`）。

    ```env
    SECRET_KEY=change-this-to-a-random-secret
    ADMIN_USERNAME=admin
    ADMIN_PASSWORD=admin
    RENDER_API_KEY=replace-with-your-render-api-key
    RENDER_SERVICE_ID=srv-d7hpcrjbc2fs73dkhuk0
    RENDER_OWNER_ID=replace-with-your-render-owner-id
    RENDER_API_BASE_URL=https://api.render.com/v1
    # 選填：若你有固定 logs API 路徑
    # RENDER_LOGS_API_URL=https://api.render.com/v1/services/<service-id>/logs?limit=60
    ```

    > 注意：`.env` 已在 `.gitignore`，請勿提交真實金鑰。

## 本機啟動

1. 安裝套件

```bash
pip install -r requirements.txt
```

2. 啟動伺服器

```bash
python app.py
```

3. 開啟瀏覽器

```text
http://127.0.0.1:8080/
```

## API 說明

- GET /api/episodes
  - 回傳章節清單資訊
- GET /api/episodes/<slug>
  - 回傳指定章節完整內容
- GET /api/ep1
  - 相容舊版端點（建議優先使用 `/api/episodes/<slug>`）
- GET /api/members
  - 回傳成員卡片資料
- GET /api/events
  - 回傳活動資料（目前為空陣列，前端顯示留白提示）
- POST /api/admin/render-check
  - 後台 Render 連線可達性檢查（需先登入）
- POST /api/admin/render-sync
  - 同步 Render logs 至本地後台日誌（需先登入）

## 其他路由

- GET /activities
  - 照片 / 影片展廊頁（第三階段入口頁）
- GET /partners
  - 贊助商 / 合作夥伴頁（第三階段入口頁）
- GET /admin
  - 後台登入頁
- POST /admin/login
  - 管理員登入
- GET /admin/logs
  - 後台日誌檢視頁
- POST /admin/logout
  - 管理員登出
- GET /login
  - 轉址至 `/admin`（相容舊入口）
- GET /sitemap.xml
  - 網站地圖
- GET /robots.txt
  - 搜尋引擎爬取規則

## 設計方向

- 配色: 乾淨白底搭配暖米色紙感
- 字體: 內文字體易讀，標題採襯線字呈現歷史感
- 動效: 低干擾、柔和的進場與滑過互動
- 氛圍: 現代整理過的歷史檔案頁

## 聯絡方式

- 合作及服務信箱: a380.500er@gmail.com
- 投訴與建議表單: https://docs.google.com/forms/d/e/1FAIpQLSeGnXZ1IvkUsSnjG5oRvSrHJzH_lTWJq57Duk9-9eQCI-a7pw/viewform

---

## 🚀 優化計劃 & 路線圖

### 第一階段：立即可做（高優先級）
視覺與易用性快速勝利，預估 1-2 週完成

- [x] **Favicon 設置** - 用 logo.jpg 設為瀏覽器分頁圖標
  - 實作: 在 `<head>` 添加 `<link rel="icon">`
  - 影響: 立刻提升品牌辨識度

- [x] **返回頂部按鈕** - 頁面滾動時顯示、點擊平滑返回
  - 實作: JavaScript 監聽滾動事件，CSS 淡入淡出動畫
  - 影響: 改善長頁面使用體驗

- [x] **頁內目錄導航（左側）** - 側欄提供頁內章節快速跳轉
  - 實作: 使用固定左側導覽與抽屜式導覽
  - 說明: 文章內快速目錄已移除，避免與主導覽重複
  - 影響: 維持定位效率，同時降低版面干擾

- [x] **平滑滾動** - CSS `scroll-behavior: smooth` 全域啟用
  - 實作: 在 `:root` 或 `html` 添加單行 CSS
  - 影響: 視覺連貫性提升，專業感增加

### 第二階段：中期改進（中優先級）
功能與內容擴充，預估 2-3 週完成

- [x] **頁面加載動畫** - 首屏加載時的骨架屏或進度條
  - 實作: 使用 CSS 動畫骨架屏，JS 控制可見性
  - 影響: 降低感知加載時間

- [x] **SEO 優化** - 補充 Meta 標籤、Open Graph、結構化數據
  - Meta: description、keywords、author、viewport
  - Open Graph: og:title, og:description, og:image, og:url
  - Schema.org: Organization, Event (未來活動用)
  - 影響: 搜尋引擎排名、社群分享預覽

- [x] **成員介紹卡片** - 社長、顧問、各科別負責人簡介
  - 實作: 新增 `/api/members` 端點 + 卡片組件
  - 內容: 照片、名字、職位、簡介、聯絡方式
  - 影響: 人員透明度、親近感

- [ ] **活動日期與時間表** - 近期活動行程、報名連結
  - 實作: 新增 `/api/events` 端點 + 日期卡片
  - 內容: 日期、地點、主題、報名連結（目前先留白）
  - 影響: 活動宣傳、參與度提升

### 第三階段：長期完善（低優先級）
深度內容與系統化，預估 1 個月以上

- [x] **照片 / 影片展廊（基礎版）** - 歷年活動集錦、回顧視頻
  - 實作: 已新增 `/activities` 入口頁
  - 待補: 分類相簿、YouTube 嵌入與內容上架

- [x] **贊助商 / 合作夥伴列表（基礎版）** - Logo 展示區塊
  - 實作: 已新增 `/partners` 入口頁
  - 待補: Logo、連結、贊助等級與後端管理

- [ ] **會員登入系統** - 簡單會員區（未來擴展用）
  - 實作: JWT 認證 + 簡易用戶資料庫（SQLite）
  - 功能: 會員登入、個人檔案、活動報名紀錄

- [x] **後台登入與日誌中心（已完成）**
  - 實作: `/admin`、`/admin/login`、`/admin/logs`、`/admin/logout`
  - 功能: 管理員登入、操作稽核、Render logs 同步

- [x] **404 錯誤頁面** - 自訂設計、返回首頁按鈕
  - 實作: 已新增 Flask 404 handler 與自訂頁面

- [x] **網站地圖 + robots.txt** - SEO 搜尋引擎友善
  - 實作: 已提供 `sitemap.xml` 與 `robots.txt` 路由

- [x] **性能優化（第一步）** - 快取策略
  - 實作: API 禁用快取、靜態資源啟用 Cache-Control
  - 待補: CSS/JS minify、圖像格式優化

- [x] **無障礙訪問 (A11Y)（第一步）** - 鍵盤與焦點可視化
  - 實作: 新增 skip-link 與 `:focus-visible` 樣式
  - 待補: 完整 WCAG 2.1 AA 檢測

---

## 🔧 下一步優化建議（可直接執行）

### 優先級 A（先做，1-3 天）

1. 活動資料正式上線
    - 將 `/api/events` 由空陣列改為真實資料
    - 前端活動卡片補上「報名連結」按鈕與狀態（報名中 / 已截止）

2. 圖片效能優化
    - 首頁關鍵圖片改 WebP
    - 非首屏圖片加入 lazy loading 與尺寸屬性

3. 導覽體驗細修
    - 手機抽屜加入「Esc 關閉」與焦點鎖定
    - 增加目前所在章節高亮穩定性（滾動時同步）

### 優先級 B（中期，3-7 天）

1. 會員系統 MVP
    - SQLite + JWT + 基本登入/登出
    - 先做最小功能：會員資料頁、活動報名紀錄頁

2. 內容管理化
    - 將 members/events 從硬編碼搬到 JSON 或資料庫
    - 建立簡單後台表單（新增/編輯/下架）

3. SEO 強化
    - sitemap 加上 lastmod / changefreq
    - 補 canonical 與社群分享預設圖尺寸

### 優先級 C（長期）

1. 活動展廊正式版
    - `/activities` 加入相簿分類、影片嵌入、年度索引

2. 夥伴頁正式版
    - `/partners` 加入 Logo 牆、贊助等級、點擊追蹤

3. A11Y 完整檢測
    - 依 WCAG 2.1 AA 逐項修正對比、語意、鍵盤路徑

---

### 🎯 優先級建議（如果只選 5 個）

依照影響力與實作難度排序：

1. **SEO + Open Graph** → 分享到社群時預覽漂亮、搜尋引擎友善
2. **Favicon** → 立刻提升品牌辨識度
3. **平滑滾動 + 返回頂部** → 改善使用體驗
4. **頁內目錄** → 首頁內容多，需要快速定位
5. **社交分享** → 提高傳播力

---

### 💻 技術細節

#### 後端擴展建議
- 使用 Flask Blueprint 組織路由
- 考慮遷移至 PostgreSQL 存儲會員、活動、文章
- 添加簡單的 Admin 後台（Flask-Admin）
- CORS 配置（跨域請求處理）

#### 前端擴展建議
- 考慮引入前端框架（Vue 3 或 React）以管理複雜狀態
- 或繼續使用 vanilla JS + 模板引擎（Jinja2）
- CSS 預處理器 (Sass/SCSS) 以管理複雜樣式
- 動畫庫 (Framer Motion / AOS) 提升視覺效果

#### 部署建議
- GitHub Actions 自動化測試與部署
- Render 環境變數安全管理
- CDN 加速靜態資源（Cloudflare）
- 監控與日誌 (Sentry, LogRocket)
