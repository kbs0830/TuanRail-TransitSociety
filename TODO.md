# 团‧鐵道 網站改善 TODO

> 最後更新：2026-05-25

---

## 🔴 高優先度（影響上線品質）

### SEO / Meta
- [x] **修正 OG / Schema.org 的 localhost URL**
  - 改用 `SITE_URL` 環境變數（`backend/config.py`），context processor 注入，fallback 為 `request.url_root`
- [x] **加入 `<link rel="canonical">`** 避免重複頁面索引問題
- [x] **加入 `sitemap.xml`** 與 `robots.txt`（已有 Flask 路由於 `system.py`）
- [x] **補完 OG image meta**（`og:image` / `twitter:image`）已補上，使用 logo.jpg

### Favicon / 圖片格式
- [x] **Favicon 加入 `sizes="any"` 與 `apple-touch-icon`**（`base.html`）；要完整相容需手動將 logo.jpg 轉換為 .ico 或 .png
- [ ] **Logo 改成 `.webp` 或 `.png`**，目前 `.jpg` 沒有透明度，深色背景會有白框（需手動轉檔）

### 內容一致性
- [x] **Q&A 重複渲染問題**：已移除 `announcement-article` 內的靜態 Q&A HTML，保留 `#qaSection` 的 JS 動態渲染版本。
- [x] **sidebar nav 佔位文字**：已確認最新版本不存在，先前版本已移除。

---

## 🟡 中優先度（體驗 / 功能完整性）

### 頁面內容補完
- [ ] **Activities 頁面（`/activities`）**：目前全為佔位文字，「相簿區」「影片區」都是空殼，需要真實內容或暫時隱藏入口按鈕
- [ ] **Partners 頁面（`/partners`）**：需確認是否有實際內容
- [x] **Events 區塊**：`#eventsSection` 已更新為「即將公告」提示文字

### 成員資料
- [ ] **成員頭像**：`MEMBERS` 沒有圖片欄位，成員卡片目前無視覺識別，考慮加 `avatar` 欄位
- [ ] **成員資料擴充**：目前只有 3 筆（社長、顧問團、多媒體科），分工欄位較簡略

### 效能
- [x] **Google Fonts `font-display: swap`**（`base.html`），原 URL 已內含 `display=swap` 參數，已確認正確
- [ ] **圖片改用 `<picture>` + WebP**，提升 LCP 指標
- [ ] **`loading="eager"` 的 logo**（`index.html:89`）重複出現於 loader 和主頁，確認 preload 是否必要

### 無障礙（a11y）
- [ ] **Sidebar 的 `anchor-link`** 若使用純 anchor scroll，需確保鍵盤可操作（focus ring 可見）
- [x] **`#drawerToggle` 按鈕**：`aria-expanded` 已在 `drawer.js:72` 中正確同步更新
- [ ] **翻牌機 `#nextTrainBoard`**：`aria-live="polite"` 已設，確認動態更新時 screen reader 能正常朗讀

---

## 🟢 低優先度（加分功能）

### 暗色模式
- [ ] 加入 `prefers-color-scheme: dark` 媒體查詢，提供基本暗色配色

### 搜尋功能
- [ ] 利用現有 `/api/stations` 資料，在前端加入車站搜尋框（已有資料，只缺 UI）

### 社群整合
- [ ] `#supportSection` 的 FB 連結（`#fbLink`）由 JS 從 API 注入，確認 `SITE_INFO.fb` URL 正確且已上線

### 後台 / Admin
- [ ] **Render logs 頁面**：`render_service.py` 有完整實作，但需確認 `.env` 的 `RENDER_API_KEY` 與 `RENDER_SERVICE_ID` 已在正式環境設定
- [ ] 後台登入後考慮加入 CSRF 保護

### 程式碼品質
- [ ] `/api/ep1`（`api.py:41`）是 legacy 路由，確認前端是否還有依賴，若無則移除
- [ ] `content.py` 裡的資料越來越多，長期考慮改用 JSON 檔案或輕量資料庫（SQLite）管理

---

## 完成項目

- [x] 基礎 CSS 模組架構（variables / reset / typography / layout）
- [x] 側邊欄導覽 + drawer 功能
- [x] 頁面載入動畫（loader card）
- [x] 翻牌顯示器（flip board）
- [x] API 路由架構（episodes / members / events / stations）
- [x] 後台 admin 頁面與 Render log 整合
- [x] 404 錯誤頁面
- [x] 無障礙 skip link
- [x] SEO：og:url / Schema.org URL 改為 SITE_URL 環境變數動態注入
- [x] SEO：canonical link、og:image、twitter:image 補完
- [x] sitemap.xml 與 robots.txt Flask 路由
- [x] Q&A 靜態/動態重複渲染問題修正
- [x] Events 區塊「即將公告」提示文字
- [x] drawerToggle aria-expanded 同步（drawer.js）
- [x] Favicon apple-touch-icon 補完
- [x] **鐵道視覺元素全面強化**（rail-elements.css）
  - Split-Flap 翻牌時鐘（station-clock.js，HH:MM:SS 逐格動畫）
  - Solari 出發看板（黑底琥珀、sb-track-rule 枕木軌道線）
  - 月台號碼徽章（data-platform + CSS attr()）
  - 側邊欄捷運路線圖（垂直漸層線 + 站牌圓點，取代 border-left）
  - 各 Section 頂部路線色條（台鐵藍/高鐵橘/捷運各線/JR 綠藍）
- [x] **台灣/日本鐵道路線色變數**（variables.css，10 條路線色）
- [x] **CLAUDE.md** 新建（架構、任務查詢、設計規範）
