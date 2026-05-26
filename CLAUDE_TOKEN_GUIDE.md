# 省 Claude Token 實用指南

> 這份文件整理在使用 Claude Code（CLI / Web）開發時，有效減少 token 消耗的方法。

---

## 一、理解 token 是怎麼被消耗的

每一輪對話，Claude 讀取的內容包括：
1. **System prompt**（設定、工具描述）
2. **所有歷史對話**（你說的 + Claude 說的）
3. **工具呼叫結果**（讀到的檔案、指令輸出）
4. **Claude 的回應**

歷史對話會隨著對話長度**線性成長**，這是 token 的最大殺手。

---

## 二、最省 token 的方式

### 1. 用 `/clear` 切換任務
每次切換到新任務前執行 `/clear`，清空歷史對話。
不同任務共用一個 session 是最浪費 token 的行為之一。

```
# 完成一個任務後
/clear

# 開始新任務
修改 partners.html 的版面...
```

### 2. 寫 `CLAUDE.md` 取代重複說明
把專案背景、常用指令、架構說明寫進 `CLAUDE.md`，Claude 啟動時自動讀取，不需要每次在對話裡重複解釋。

```markdown
# CLAUDE.md 範例
這是 Flask + Jinja2 的網站專案。
前端模板在 frontend/templates/，靜態資源在 frontend/static/。
API 路由在 backend/routes/api.py。
啟動指令：python app.py
```

> 好的 CLAUDE.md 可以讓每輪對話少說幾百個 token 的背景說明。

### 3. 問法要具體，避免「幫我看整個專案」
模糊的提問會讓 Claude 讀很多不必要的檔案。

| 浪費 token 的問法 | 省 token 的問法 |
|---|---|
| 幫我看整個網站有什麼問題 | 檢查 index.html 的 meta tag 是否正確 |
| 這個專案怎麼跑？ | app.py 的啟動指令是什麼？ |
| 幫我重構整個 CSS | 把 index.css 第 30 行的顏色變數抽到 variables.css |

### 4. 只讀你需要的部分（指定行號或檔案）
Claude 工具讀整個大檔案很耗 token。在提問時直接指定範圍：

```
# 不好
幫我看 content.py

# 好
content.py 的 MEMBERS 資料（大約在第 31-50 行）需要加 avatar 欄位
```

### 5. 用 subagent 隔離大型任務
遇到需要大量搜尋或研究的任務，用 `Agent` 工具開 subagent，讓結果精簡後回傳，避免大量中間資料污染主要對話。

Claude Code 的 Explore agent 特別適合「找某個 function 在哪裡」這類搜尋任務。

### 6. 避免讓 Claude 重複確認已完成的事
不需要在每次 edit 之後說「請讀取檔案確認修改正確」。
Edit/Write 工具失敗會直接報錯，成功就是成功。

### 7. 使用 `/compact` 壓縮對話（當 context 快滿時）
長對話中途可以執行 `/compact` 讓 Claude 把之前的對話壓縮成摘要，釋放 context 空間。

```
/compact
```

---

## 三、這個專案的省 token 建議

針對 **TuanRail-TransitSociety** 的特性：

### 建立 CLAUDE.md
```markdown
# CLAUDE.md

Flask + Jinja2 專案，Python 3.x。

## 架構
- 後端：backend/（Flask blueprints）
- 前端模板：frontend/templates/
- 靜態資源：frontend/static/（CSS 模組化，入口 css/index.css）
- 網站內容資料：backend/content.py
- 啟動：python app.py（預設 port 8080）

## 常見任務
- 改文字內容 → backend/content.py
- 改頁面 HTML → frontend/templates/
- 改樣式 → frontend/static/css/（找對應模組）
- 新增 API → backend/routes/api.py
```

### 任務切分建議
| 任務類型 | 建議做法 |
|---|---|
| 只改文字（Q&A、成員介紹） | 直接指定 `content.py` 的對應 key |
| 只改樣式 | 指定對應的 CSS 模組檔案名稱 |
| 改 HTML 結構 | 指定 template 檔名 + 大約行號 |
| 新增頁面 | 說清楚路由、template、需要哪些 API |

---

## 四、token 消耗速查

| 動作 | 大約 token 量 | 備註 |
|---|---|---|
| 讀一個小型 HTML 檔案 | ~500–1,000 | 如 activities.html |
| 讀一個大型 HTML 檔案 | ~2,000–4,000 | 如 index.html |
| 讀 content.py | ~1,500 | 含所有資料結構 |
| 一輪普通對話（問+答） | ~500–2,000 | 視問題複雜度 |
| `/clear` 之後 | 0（重設） | 歷史歸零 |
| 對話進行 20 輪後的 context | 可能 10,000+ | 建議定期 /clear |

---

## 五、快速記憶口訣

```
任務開始 → 看有沒有 CLAUDE.md
任務切換 → /clear
對話太長 → /compact
提問 → 具體 + 指定檔案 + 指定範圍
研究任務 → 開 subagent
不需要確認 → 不要叫 Claude 重讀剛改的檔案
```
