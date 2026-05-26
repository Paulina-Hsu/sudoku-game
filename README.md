# sudoku-game

手機與桌機都能使用的數獨小遊戲，使用 Next.js、React、TypeScript 與 Tailwind CSS 製作，並部署在 Vercel。

## Links

- GitHub: https://github.com/Paulina-Hsu/sudoku-game
- Production: https://sudoku-game-bay-iota.vercel.app

## 功能

- 9x9 數獨棋盤
- 題目給定數字不可修改
- 選取格、同行、同列、同九宮格高亮
- 相同數字淡色提示
- 1 到 9 數字按鈕與清除按鈕
- 支援鍵盤輸入 1 到 9、Backspace、Delete、0，以及方向鍵移動選取格
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
