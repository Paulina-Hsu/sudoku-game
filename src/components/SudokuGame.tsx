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

export function SudokuGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [puzzle, setPuzzle] = useState<Puzzle>(() => puzzles.easy[0]);
  const [grid, setGrid] = useState<SudokuGrid>(() => cloneGrid(puzzle.puzzle));
  const [selected, setSelected] = useState<CellPosition | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [message, setMessage] = useState("選一格，開始填入 1 到 9。");

  const selectedIsFixed = selected
    ? isOriginalCell(puzzle.puzzle, selected.row, selected.col)
    : false;

  const errorCount = useMemo(
    () => countErrors(grid, puzzle.solution),
    [grid, puzzle.solution],
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
      setMessage(`${nextPuzzle.title} 已開始。`);
    },
    [difficulty],
  );

  const placeNumber = useCallback(
    (value: number | null) => {
      if (!selected || selectedIsFixed || completed) {
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
        setMessage(`恭喜完成！用時 ${formatElapsedTime(elapsedSeconds)}。`);
        return;
      }

      setShowErrors(false);
      setMessage(value === null ? "已清除選取格。" : `已填入 ${value}。`);
    },
    [
      completed,
      elapsedSeconds,
      grid,
      puzzle.solution,
      selected,
      selectedIsFixed,
    ],
  );

  const checkAnswer = useCallback(() => {
    setShowErrors(true);

    if (completed) {
      setMessage(`完成！用時 ${formatElapsedTime(elapsedSeconds)}。`);
      return;
    }

    if (errorCount > 0) {
      setMessage(`目前有 ${errorCount} 格需要修正。`);
      return;
    }

    setMessage("目前填入的數字都正確，繼續完成剩下空格。");
  }, [completed, elapsedSeconds, errorCount]);

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
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [placeNumber]);

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#1f2933]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#3f7d58]">Sudoku</p>
            <h1 className="text-3xl font-bold tracking-normal text-[#102027] sm:text-4xl">
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
              className="h-11 rounded-md border border-[#c9d6c5] bg-white px-3 text-sm font-semibold text-[#23313a] shadow-sm outline-none transition focus:border-[#3f7d58] focus:ring-2 focus:ring-[#3f7d58]/20"
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
              className="h-11 rounded-md bg-[#2541b2] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#1e3696] focus:outline-none focus:ring-2 focus:ring-[#2541b2]/30"
            >
              新遊戲
            </button>
          </div>
        </header>

        <section className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="mx-auto w-full max-w-[560px] lg:max-w-none">
            <div className="mb-3 grid grid-cols-3 gap-2 rounded-md border border-[#d9d2c3] bg-white px-3 py-3 shadow-sm sm:grid-cols-4">
              <Stat label="題目" value={puzzle.title} />
              <Stat label="難度" value={difficultyLabel(difficulty)} />
              <Stat label="時間" value={formatElapsedTime(elapsedSeconds)} />
              <Stat label="錯誤" value={showErrors ? String(errorCount) : "-"} />
            </div>

            <div
              className="grid aspect-square w-full grid-cols-9 overflow-hidden rounded-md border-2 border-[#1f2933] bg-[#1f2933] shadow-lg"
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
                      aria-label={`第 ${rowIndex + 1} 列第 ${colIndex + 1} 欄${
                        value ? `，數字 ${value}` : "，空白"
                      }`}
                      onClick={() =>
                        setSelected({ row: rowIndex, col: colIndex })
                      }
                      className={[
                        "flex aspect-square items-center justify-center border-[#2f3a40] text-xl font-bold outline-none transition sm:text-2xl",
                        "border-r border-b",
                        colIndex === 2 || colIndex === 5
                          ? "border-r-2"
                          : "",
                        rowIndex === 2 || rowIndex === 5
                          ? "border-b-2"
                          : "",
                        isSelected
                          ? "bg-[#f2c94c] text-[#18212a] ring-2 ring-inset ring-[#b7791f]"
                          : related
                            ? "bg-[#dceadf] text-[#1f2933]"
                            : "bg-white text-[#1f2933]",
                        isFixed ? "font-black text-[#0b1720]" : "text-[#2541b2]",
                        incorrect ? "bg-[#ffe4df] text-[#b42318]" : "",
                      ].join(" ")}
                    >
                      {value}
                    </button>
                  );
                }),
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-md border border-[#d9d2c3] bg-white p-4 shadow-sm">
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
                    className="aspect-square rounded-md border border-[#cbd5cf] bg-[#f8faf9] text-2xl font-black text-[#2541b2] transition hover:bg-[#edf4ff] focus:outline-none focus:ring-2 focus:ring-[#2541b2]/30 disabled:cursor-not-allowed disabled:bg-[#f0eee8] disabled:text-[#9da7a0]"
                  >
                    {number}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => placeNumber(null)}
                disabled={!selected || selectedIsFixed || completed}
                className="mt-3 h-11 w-full rounded-md border border-[#c9d6c5] bg-white text-sm font-bold text-[#334155] transition hover:bg-[#f8faf9] focus:outline-none focus:ring-2 focus:ring-[#3f7d58]/20 disabled:cursor-not-allowed disabled:bg-[#f0eee8] disabled:text-[#9da7a0]"
              >
                清除
              </button>
            </div>

            <div className="rounded-md border border-[#d9d2c3] bg-white p-4 shadow-sm">
              <button
                type="button"
                onClick={checkAnswer}
                className="h-11 w-full rounded-md bg-[#3f7d58] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#336747] focus:outline-none focus:ring-2 focus:ring-[#3f7d58]/30"
              >
                檢查答案
              </button>
              <p
                className="mt-3 min-h-12 rounded-md bg-[#f4f0e7] px-3 py-2 text-sm font-semibold leading-6 text-[#334155]"
                aria-live="polite"
              >
                {message}
              </p>
            </div>
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
