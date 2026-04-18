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

## 目前功能

- EP1 單章節完整介紹頁
- 固定左側導覽與手機抽屜選單
- 頁內區塊導覽（前言、創社、理念、Q&A、支持）
- 創社時間軸、理念卡片、支持行動清單
- 聯絡與回饋入口（FB、投訴表單、服務信箱）

## 專案結構

```text
.
|-- app.py
|-- requirements.txt
|-- backend/
|   |-- __init__.py
|   `-- app.py
`-- frontend/
    |-- templates/
    |   `-- index.html
    `-- static/
        |-- css/
        |   `-- site.css
        `-- js/
            `-- site.js
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
- GET /api/episodes/ep1
  - 回傳 EP1 完整內容
- GET /api/ep1
  - 相容舊版的 EP1 端點

## 設計方向

- 配色: 乾淨白底搭配暖米色紙感
- 字體: 內文字體易讀，標題採襯線字呈現歷史感
- 動效: 低干擾、柔和的進場與滑過互動
- 氛圍: 現代整理過的歷史檔案頁

## 聯絡方式

- 合作及服務信箱: a380.500er@gmail.com
- 投訴與建議表單: https://docs.google.com/forms/d/e/1FAIpQLSeGnXZ1IvkUsSnjG5oRvSrHJzH_lTWJq57Duk9-9eQCI-a7pw/viewform
