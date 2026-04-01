# Txt Novel Reader

一個輕量的本地 `.txt` 小說閱讀器，以 Vue 3 + TypeScript + Vite 打造，無須後端、直接在瀏覽器執行。

## 功能

- **本地檔案讀取** — 直接開啟電腦上的 `.txt` 檔，不上傳至任何伺服器
- **章節切分**
  - 依正規表示式（預設：`第.*章[^\n\r]*`，適用常見中文章節標題）
  - 依每章最大行數
- **主題切換** — 白底、護眼黃、深色三種主題
- **閱讀進度記憶** — 離開後重新開啟仍保留上次閱讀的章節與設定
- **章節目錄側欄** — 快速跳轉至任意章節
- **示範小說** — 首次開啟時載入內建示範內容，可立即體驗

## 開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置正式版
npm run build
```

## 技術棧

- [Vue 3](https://vuejs.org/) (Composition API)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
