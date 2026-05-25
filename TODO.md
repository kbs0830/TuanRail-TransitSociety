# 团‧鐵道 網站改善 TODO

> 最後更新：2026-05-25

---

## 🔴 高優先度（影響上線品質）

### SEO / Meta
- [ ] **修正 OG / Schema.org 的 localhost URL**
  - `index.html:5` `og:url` 寫死 `http://127.0.0.1:8080/`
  - `index.html:14` Schema.org `url` 同樣寫死 localhost
  - 改成讀取環境變數或 config 動態產生正式域名
- [ ] **加入 `<link rel="canonical">`** 避免重複頁面索引問題
- [ ] **加入 `sitemap.xml`** 與 `robots.txt`
- [ ] **補完 OG image meta**（`og:image`）目前缺少，社群分享會空白

### Favicon / 圖片格式
- [ ] **Favicon 改成 `.ico` 或 `.png`**，目前用 `.jpg`（部分瀏覽器不支援 jpg favicon）
- [ ] **Logo 改成 `.webp` 或 `.png`**，目前 `.jpg` 沒有透明度，深色背景會有白框

### 內容一致性
- [ ] **Q&A 重複渲染問題**：`index.html` 有靜態 Q&A HTML（第 173–199 行），同時 JS 也從 API 動態渲染 `#qaList`，兩份內容並存。建議擇一，移除靜態版本。
- [ ] **sidebar nav 描述有明顯佔位文字**：「活動公告」的 `anchor-desc` 寫著「目前暫留白，後續補上」（`index.html:74`），上線前應移除或更新。

---

## 🟡 中優先度（體驗 / 功能完整性）

### 頁面內容補完
- [ ] **Activities 頁面（`/activities`）**：目前全為佔位文字，「相簿區」「影片區」都是空殼，需要真實內容或暫時隱藏入口按鈕
- [ ] **Partners 頁面（`/partners`）**：需確認是否有實際內容
- [ ] **Events 區塊**：`content.py:52` `EVENTS = []`，`#eventsSection` 完全空白，建議補上第一筆活動或改為「即將公告」訊息

### 成員資料
- [ ] **成員頭像**：`MEMBERS` 沒有圖片欄位，成員卡片目前無視覺識別，考慮加 `avatar` 欄位
- [ ] **成員資料擴充**：目前只有 3 筆（社長、顧問團、多媒體科），分工欄位較簡略

### 效能
- [ ] **Google Fonts 改用 `font-display: swap`**（`base.html:11`），避免字體載入時閃爍 FOIT
- [ ] **圖片改用 `<picture>` + WebP**，提升 LCP 指標
- [ ] **`loading="eager"` 的 logo**（`index.html:89`）重複出現於 loader 和主頁，確認 preload 是否必要

### 無障礙（a11y）
- [ ] **Sidebar 的 `anchor-link`** 若使用純 anchor scroll，需確保鍵盤可操作（focus ring 可見）
- [ ] **`#drawerToggle` 按鈕**：`aria-expanded` 狀態需隨開關同步更新
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
