# claw-test

沉浸式前端展示網站範例，靈感來自 Lusion 風格，包含多層次動畫、互動視差效果，以及內嵌的 Brick Breaker 打磚塊小遊戲。

## 專案簡介

此專案是一個純前端 + Node.js 輕量伺服器的展示站，重點在：

- 大型排版與動態轉場
- 自訂游標與磁吸按鈕互動
- 視差滾動與文字進場動畫
- 以 Canvas 製作的背景氛圍動畫
- 內嵌可遊玩的 Brick Breaker 小遊戲

## 功能特色

### 1. 視覺與互動

- 多層背景（漸層 + 粒子感雜訊 + 動態 blob）
- 首頁與 Projects 頁面切換時的頁面轉場
- 依滑鼠位置影響背景動態
- 卡片 3D 傾斜與視差位移效果
- 區塊捲動顯示（Intersection Observer reveal）
- 自訂游標（dot + ring）互動狀態

### 2. 內容頁面

- `index.html`: 首頁，含 Hero、Featured Work、Marquee、CTA 與小遊戲
- `projects.html`: 專案列表頁，延續相同視覺語言

### 3. 小遊戲（Brick Breaker）

- 控制方式：
	- 鍵盤 `←` / `→` 或 `A` / `D`
	- 滑鼠移動控制板子
	- `Space` 可開始 / 暫停 / 繼續
- 遊戲機制：
	- 磚塊碰撞判定
	- 分數、生命值、最高分
	- 勝利 / 失敗疊層畫面

## 技術組成

- 前端：HTML5 + CSS3 + Vanilla JavaScript
- 動畫：CSS Animation + requestAnimationFrame
- 遊戲：HTML5 Canvas 2D API
- 伺服器：Node.js 內建 `http` 模組（無額外相依套件）

## 檔案結構

```
claw-test/
├─ index.html      # 首頁 + 小遊戲
├─ projects.html   # 專案列表頁
├─ styles.css      # 全站樣式、動畫、響應式設計
├─ main.js         # 全站互動邏輯與動畫控制
├─ server.js       # 靜態檔案伺服器
└─ README.md
```

## 快速開始

### 需求

- Node.js 18+（建議）

### 啟動步驟

1. 進入專案資料夾
2. 執行：

```bash
node server.js
```

3. 開啟瀏覽器前往：

- `http://localhost:3000`

啟動後終端機也會顯示區網可連線位址（Network URL）。

## 常見問題

### 無法啟動（`node sever.js`）

請確認檔名是 `server.js`，不是 `sever.js`：

```bash
node server.js
```

### 開啟是 404

- 請確認目前工作目錄在專案根目錄
- `index.html`、`projects.html`、`styles.css`、`main.js` 是否存在於同一層

## 後續可擴充方向

- 將小遊戲分離成獨立模組檔案
- 加入分數持久化（LocalStorage）
- 增加更多頁面與內容管理
- 導入打包工具（如 Vite）以優化開發流程

## 授權

目前未附授權條款；如需開源，建議新增 `LICENSE`（例如 MIT）。