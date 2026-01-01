# Taiwan Railway Diagram (React Migration)

這是[台鐵運行圖](https://tradiagram.com)的 React 重構版本。
本專案旨在將原有的 jQuery + SVG.js 架構遷移至現代化的 React + Vite 架構，並改用原生 SVG 進行渲染，以提升效能與維護性。

## 專案狀態

🚧 **開發中 (Work in Progress)**

目前已完成 MVP (Minimum Viable Product) 功能：
- [x] 專案初始化 (Vite + React)
- [x] 路由設定 (React Router)
- [x] 核心邏輯移植 (資料處理、座標計算)
- [x] 運行圖繪製 (原生 SVG 實作)
- [x] 資料讀取 (支援 JSON 格式時刻表)

### 安裝依賴

```bash
npm install
```

### 啟動開發伺服器

```bash
npm run dev
```

### 建置生產版本

```bash
npm run build
```

## 專案結構

```
tradiagram/
├── automation/
├── docs/archive/
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── public/
│   ├── data/           # 時刻表 JSON 資料
│   ├── images/
│   ├── references/     # 路線、車站、車種定義檔
│   └── sitemap.xml
├── src/
│   ├── App.jsx         # 應用程式入口與路由
│   ├── assets/
│   ├── components/     # React 元件
│   │   ├── diagram/    # 運行圖繪製 (SVG)
│   │   ├── DiagramCanvas.jsx
│   │   ├── DiagramView.jsx
│   │   ├── FloatingStationLabels.jsx
│   │   ├── SelectionModal.jsx
│   │   ├── SelectionModal.module.css
│   │   └── Sidebar/
│   ├── hooks/useDiagramData.js
│   ├── main.jsx        # 渲染入口
│   ├── pages/          # 頁面元件
│   │   ├── DiagramPage.jsx    # 運行圖頁面 (負責資料抓取)
│   │   ├── HomePage.jsx       # 首頁
│   │   └── HomePage.module.css
│   └── utils/          # 工具函式 (核心邏輯)
│       ├── commonUtils.js     # 通用工具
│       ├── constants.js       # 常數定義
│       ├── dataUtils.js       # 資料處理邏輯
│       └── diagramUtils.js    # 繪圖計算邏輯
└── vite.config.js
```

## 技術棧

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM v7
- **Rendering**: Native SVG (不再依賴 SVG.js)
- **Styling**: CSS Modules / Global CSS (目前沿用部分舊版 CSS)

## 資料來源

https://github.com/billy1125/billy1125.github.io

[政府資料開放平臺](https://data.gov.tw/)
