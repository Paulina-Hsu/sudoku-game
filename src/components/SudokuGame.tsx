"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DIFFICULTIES, puzzles } from "@/data/puzzles";
import {
  cloneGrid,
  countErrors,
  formatElapsedTime,
  getRandomPuzzle,
  hasIncorrectValue,
  isComplete,
  isOriginalCell,
  isRelatedCell,
  type CellPosition,
} from "@/lib/sudoku";
import type { Difficulty, Puzzle, SudokuGrid } from "@/types/sudoku";

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

type MessageTone = "info" | "error" | "success";

export function SudokuGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [puzzle, setPuzzle] = useState<Puzzle>(() => puzzles.easy[0]);
  const [grid, setGrid] = useState<SudokuGrid>(() => cloneGrid(puzzle.puzzle));
  const [selected, setSelected] = useState<CellPosition | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [message, setMessage] = useState("選一格空白格，開始填入 1 到 9。");
  const [messageTone, setMessageTone] = useState<MessageTone>("info");

  const selectedIsFixed = selected
    ? isOriginalCell(puzzle.puzzle, selected.row, selected.col)
    : false;

  const selectedValue = selected ? grid[selected.row][selected.col] : null;

  const errorCount = useMemo(
    () => countErrors(grid, puzzle.solution),
    [grid, puzzle.solution],
  );

  const emptyCount = useMemo(
    () => grid.flat().filter((value) => value === null).length,
    [grid],
  );

  const completed = useMemo(
    () => isComplete(grid, puzzle.solution),
    [grid, puzzle.solution],
  );

  const startNewGame = useCallback(
    (nextDifficulty: Difficulty = difficulty) => {
      const nextPuzzle = getRandomPuzzle(nextDifficulty);

      setDifficulty(nextDifficulty);
      setPuzzle(nextPuzzle);
      setGrid(cloneGrid(nextPuzzle.puzzle));
      setSelected(null);
      setShowErrors(false);
      setElapsedSeconds(0);
      setTotalMistakes(0);
      setMessage(`${nextPuzzle.title} 已開始，選一格空白格來填數字。`);
      setMessageTone("info");
    },
    [difficulty],
  );

  const selectCell = useCallback(
    (row: number, col: number) => {
      setSelected({ row, col });

      if (isOriginalCell(puzzle.puzzle, row, col)) {
        setMessage("這是題目給定數字，不能修改。");
        setMessageTone("info");
        return;
      }

      setMessage("可以用下方按鈕或鍵盤輸入數字。");
      setMessageTone("info");
    },
    [puzzle.puzzle],
  );

  const placeNumber = useCallback(
    (value: number | null) => {
      if (!selected) {
        setMessage("請先選擇一格空白格。");
        setMessageTone("info");
        return;
      }

      if (selectedIsFixed) {
        setMessage("這是題目給定數字，不能修改。");
        setMessageTone("info");
        return;
      }

      if (completed) {
        return;
      }

      const nextGrid = grid.map((row, rowIndex) =>
        row.map((cell, colIndex) =>
          rowIndex === selected.row && colIndex === selected.col
            ? value
            : cell,
        ),
      );

      setGrid(nextGrid);

      if (isComplete(nextGrid, puzzle.solution)) {
        setShowErrors(true);
        setMessage(
          `完成時間：${formatElapsedTime(elapsedSeconds)}。錯誤：${totalMistakes} 次。`,
        );
        setMessageTone("success");
        return;
      }

      setShowErrors(false);
      setMessage(value === null ? "已清除選取格。" : `已填入 ${value}。`);
      setMessageTone("info");
    },
    [
      completed,
      elapsedSeconds,
      grid,
      puzzle.solution,
      selected,
      selectedIsFixed,
      totalMistakes,
    ],
  );

  const checkAnswer = useCallback(() => {
    setShowErrors(true);

    if (completed) {
      setMessage(
        `完成時間：${formatElapsedTime(elapsedSeconds)}。錯誤：${totalMistakes} 次。`,
      );
      setMessageTone("success");
      return;
    }

    if (errorCount > 0) {
      const nextTotalMistakes = totalMistakes + 1;

      setTotalMistakes(nextTotalMistakes);
      setMessage(
        `目前有 ${errorCount} 格和答案不一致。錯誤：${nextTotalMistakes} 次。紅色格請再確認。`,
      );
      setMessageTone("error");
      return;
    }

    setMessage(`目前填入的數字都正確，還有 ${emptyCount} 格空白。`);
    setMessageTone("success");
  }, [
    completed,
    elapsedSeconds,
    emptyCount,
    errorCount,
    totalMistakes,
  ]);

  useEffect(() => {
    if (completed) {
      return;
    }

    const timerId = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [completed, puzzle.id]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key >= "1" && event.key <= "9") {
        placeNumber(Number(event.key));
        return;
      }

      if (
        event.key === "Backspace" ||
        event.key === "Delete" ||
        event.key === "0"
      ) {
        placeNumber(null);
        return;
      }

      if (!selected) {
        return;
      }

      const movement = {
        ArrowUp: [-1, 0],
        ArrowRight: [0, 1],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
      }[event.key] as [number, number] | undefined;

      if (!movement) {
        return;
      }

      event.preventDefault();
      selectCell(
        Math.min(8, Math.max(0, selected.row + movement[0])),
        Math.min(8, Math.max(0, selected.col + movement[1])),
      );
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [placeNumber, selectCell, selected]);

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#1f2933]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-3 px-2 py-3 sm:gap-5 sm:px-6 sm:py-4 lg:px-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
          <div>
            <p className="text-sm font-semibold text-[#3f7d58]">Sudoku</p>
            <h1 className="text-2xl font-bold tracking-normal text-[#102027] sm:text-4xl">
              數獨小遊戲
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <label className="sr-only" htmlFor="difficulty">
              難度
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(event) =>
                startNewGame(event.target.value as Difficulty)
              }
              className="h-12 rounded-md border border-[#c9d6c5] bg-white px-3 text-base font-semibold text-[#23313a] shadow-sm outline-none transition focus:border-[#3f7d58] focus:ring-2 focus:ring-[#3f7d58]/20 sm:h-11 sm:text-sm"
            >
              {DIFFICULTIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => startNewGame()}
              className="h-12 rounded-md bg-[#2541b2] px-4 text-base font-bold text-white shadow-sm transition hover:bg-[#1e3696] focus:outline-none focus:ring-2 focus:ring-[#2541b2]/30 sm:h-11 sm:text-sm"
            >
              新遊戲
            </button>
          </div>
        </header>

        {completed ? (
          <section
            className="rounded-md border border-[#7bbf8a] bg-[#e6f6e9] px-4 py-3 text-[#1d5d35] shadow-sm"
            aria-live="polite"
          >
            <p className="text-lg font-black">完成！恭喜解開這一局。</p>
            <p className="mt-1 text-sm font-semibold">
              完成時間：{formatElapsedTime(elapsedSeconds)}
            </p>
            <p className="text-sm font-semibold">
              錯誤：{totalMistakes} 次
            </p>
          </section>
        ) : null}

        <section className="grid flex-1 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="mx-auto w-full max-w-[640px] lg:max-w-none">
            <div className="mb-2 grid grid-cols-2 gap-2 rounded-md border border-[#d9d2c3] bg-white px-2 py-2 shadow-sm sm:mb-3 sm:grid-cols-5 sm:px-3 sm:py-3">
              <Stat label="題目" value={puzzle.title} />
              <Stat label="難度" value={difficultyLabel(difficulty)} />
              <Stat label="時間" value={formatElapsedTime(elapsedSeconds)} />
              <Stat label="錯誤次數" value={`錯誤：${totalMistakes} 次`} />
              <Stat label="錯格" value={showErrors ? String(errorCount) : "-"} />
            </div>

            <div
              className="grid aspect-square w-full touch-manipulation grid-cols-9 overflow-hidden rounded-md border-2 border-[#1f2933] bg-[#1f2933] shadow-lg"
              role="grid"
              aria-label="數獨棋盤"
            >
              {grid.map((row, rowIndex) =>
                row.map((value, colIndex) => {
                  const isSelected =
                    selected?.row === rowIndex && selected?.col === colIndex;
                  const isFixed = isOriginalCell(
                    puzzle.puzzle,
                    rowIndex,
                    colIndex,
                  );
                  const related = isRelatedCell(selected, rowIndex, colIndex);
                  const sameValue =
                    selectedValue !== null && value === selectedValue;
                  const incorrect =
                    showErrors &&
                    hasIncorrectValue(
                      value,
                      puzzle.solution,
                      rowIndex,
                      colIndex,
                    );

                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      type="button"
                      role="gridcell"
                      aria-label={`第 ${rowIndex + 1} 列第 ${
                        colIndex + 1
                      } 欄${value ? `，數字 ${value}` : "，空白"}`}
                      onClick={() => selectCell(rowIndex, colIndex)}
                      className={[
                        "flex aspect-square min-h-9 items-center justify-center border-[#344047] text-xl font-bold outline-none transition sm:text-2xl",
                        "border-r border-b",
                        colIndex === 2 || colIndex === 5
                          ? "border-r-2"
                          : "",
                        rowIndex === 2 || rowIndex === 5
                          ? "border-b-2"
                          : "",
                        isSelected
                          ? "bg-[#f2c94c] text-[#18212a] ring-2 ring-inset ring-[#9f6b16]"
                          : incorrect
                            ? "bg-[#ffe4df] text-[#b42318]"
                            : sameValue
                              ? "bg-[#e8f0ff] text-[#2541b2]"
                              : related
                                ? "bg-[#e8f3eb] text-[#1f2933]"
                                : "bg-white text-[#1f2933]",
                        isFixed
                          ? "font-black text-[#0b1720]"
                          : "text-[#2541b2]",
                      ].join(" ")}
                    >
                      {value}
                    </button>
                  );
                }),
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-3">
            <section className="rounded-md border border-[#d9d2c3] bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-[#3f4a52]">輸入數字</p>
                <p className="text-xs font-semibold text-[#65727c]">
                  鍵盤 1-9 也可用
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {numbers.map((number) => (
                  <button
                    key={number}
                    type="button"
                    onClick={() => placeNumber(number)}
                    disabled={!selected || selectedIsFixed || completed}
                    className={[
                      "min-h-16 rounded-md border text-2xl font-black transition focus:outline-none focus:ring-2 focus:ring-[#2541b2]/30 sm:min-h-14",
                      selectedValue === number
                        ? "border-[#2541b2] bg-[#e8f0ff] text-[#18327e]"
                        : "border-[#cbd5cf] bg-[#f8faf9] text-[#2541b2] hover:bg-[#edf4ff]",
                      "disabled:cursor-not-allowed disabled:border-[#dedbd2] disabled:bg-[#f0eee8] disabled:text-[#9da7a0]",
                    ].join(" ")}
                  >
                    {number}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => placeNumber(null)}
                  disabled={!selected || selectedIsFixed || completed}
                  className="h-12 rounded-md border border-[#c9d6c5] bg-white text-base font-bold text-[#334155] transition hover:bg-[#f8faf9] focus:outline-none focus:ring-2 focus:ring-[#3f7d58]/20 disabled:cursor-not-allowed disabled:bg-[#f0eee8] disabled:text-[#9da7a0] sm:h-11 sm:text-sm"
                >
                  清除
                </button>
                <button
                  type="button"
                  onClick={checkAnswer}
                  className="h-12 rounded-md bg-[#3f7d58] px-4 text-base font-bold text-white shadow-sm transition hover:bg-[#336747] focus:outline-none focus:ring-2 focus:ring-[#3f7d58]/30 sm:h-11 sm:text-sm"
                >
                  檢查答案
                </button>
              </div>
            </section>

            <section
              className={[
                "rounded-md border px-4 py-3 shadow-sm",
                messageTone === "success"
                  ? "border-[#8bcf97] bg-[#eaf8ed] text-[#1d5d35]"
                  : messageTone === "error"
                    ? "border-[#f2a39a] bg-[#fff0ed] text-[#9f2d20]"
                    : "border-[#d9d2c3] bg-white text-[#334155]",
              ].join(" ")}
              aria-live="polite"
            >
              <p className="text-xs font-bold uppercase tracking-normal opacity-70">
                狀態
              </p>
              <p className="mt-1 min-h-10 text-sm font-semibold leading-6">
                {message}
              </p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#65727c]">{label}</p>
      <p className="truncate text-sm font-black text-[#1f2933] sm:text-base">
        {value}
      </p>
    </div>
  );
}

function difficultyLabel(difficulty: Difficulty) {
  return DIFFICULTIES.find((item) => item.value === difficulty)?.label ?? "";
}
