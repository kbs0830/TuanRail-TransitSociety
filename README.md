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
- 固定左側導覽與手機抽屜選單
- 頁內區塊導覽（前言、組織、創社史、理念、Q&A、支持、成員、活動）
- 創社時間軸、理念卡片、支持行動清單
- 返回頂部按鈕與全站平滑滾動
- 首屏加載動畫（載入遮罩與進度條）
- SEO / Open Graph / Organization 結構化資料
- 成員介紹卡片（由 API 提供）
- 活動區塊留白顯示（提供小提示元件）
- 聯絡與回饋入口（FB、投訴表單、服務信箱）

## 專案結構

```text
.
|-- app.py
|-- README.md
|-- requirements.txt
|-- backend/
|   |-- __init__.py
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
    |-- templates/
    |   `-- index.html
```

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
  - 回傳指定章節完整內容（目前可用: ep1）
- GET /api/ep1
  - 相容舊版的 EP1 端點
- GET /api/members
  - 回傳成員卡片資料
- GET /api/events
  - 回傳活動資料（目前為空陣列，前端顯示留白提示）

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

- [ ] **暗色模式** - 系統暗色模式偵測 + 手動切換
  - 狀態: 已暫停，依目前設計方向不採用
  - 原因: 與網站既有白色歷史檔案風格不一致

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

- [ ] **照片 / 影片展廊** - 歷年活動集錦、回顧視頻
  - 實作: 新增 `/activities` 頁面或燈箱圖庫
  - 內容: 分類相簿、YouTube 嵌入

- [ ] **贊助商 / 合作夥伴列表** - Logo 展示區塊
  - 實作: 新增 `/partners` 區段，後端數據庫管理
  - 內容: 企業 Logo、連結、贊助等級

- [ ] **會員登入系統** - 簡單會員區（未來擴展用）
  - 實作: JWT 認證 + 簡易用戶資料庫（SQLite）
  - 功能: 會員登入、個人檔案、活動報名紀錄


- [ ] **404 錯誤頁面** - 自訂設計、返回首頁按鈕
  - 實作: 新增 `/404` 路由或靜態頁面

- [ ] **網站地圖 + robots.txt** - SEO 搜尋引擎友善
  - 實作: 自動生成 `sitemap.xml` 和 `robots.txt`

- [ ] **性能優化** - CSS/JS 縮小、圖像最佳化、快取策略
  - CSS/JS: 使用 minify 工具
  - 圖像: WebP 格式轉換、Lazy Loading
  - 快取: HTTP Cache-Control 標頭

- [ ] **無障礙訪問 (A11Y)** - ARIA 標籤、鍵盤導航、色彩對比
  - 實作: 添加 `aria-label`、`role` 屬性
  - 鍵盤: Tab 導航、Enter 選擇
  - 測試: WCAG 2.1 AA 標準檢查

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
