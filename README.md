# sudoku-game

一個使用 Next.js、React、TypeScript 與 Tailwind CSS 製作的手機優先數獨小遊戲。

## 功能

- 9x9 數獨棋盤
- 原始題目數字不可修改
- 選取格、同行、同列、同九宮格高亮
- 下方 1 到 9 數字輸入與清除按鈕
- 支援鍵盤輸入 1 到 9、Backspace、Delete、0
- 新遊戲、難度選擇、檢查答案、錯誤提示
- 完成提示與計時器
- 內建簡單、中等、困難各 3 題

## 開發

```bash
npm install
npm run dev
```

開啟 http://localhost:3000。

## 驗證

```bash
npm run lint
npx tsc --noEmit
npm run build
```
