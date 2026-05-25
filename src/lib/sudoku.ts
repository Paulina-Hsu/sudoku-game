import type { Difficulty, Puzzle, SudokuGrid } from "@/types/sudoku";
import { puzzles } from "@/data/puzzles";

export type CellPosition = {
  row: number;
  col: number;
};

export function cloneGrid(grid: SudokuGrid): SudokuGrid {
  return grid.map((row) => [...row]);
}

export function getRandomPuzzle(difficulty: Difficulty): Puzzle {
  const options = puzzles[difficulty];
  return options[Math.floor(Math.random() * options.length)];
}

export function formatElapsedTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function isOriginalCell(puzzle: SudokuGrid, row: number, col: number) {
  return puzzle[row][col] !== null;
}

export function isRelatedCell(
  selected: CellPosition | null,
  row: number,
  col: number,
) {
  if (!selected) {
    return false;
  }

  const sameRow = selected.row === row;
  const sameCol = selected.col === col;
  const sameBox =
    Math.floor(selected.row / 3) === Math.floor(row / 3) &&
    Math.floor(selected.col / 3) === Math.floor(col / 3);

  return sameRow || sameCol || sameBox;
}

export function hasIncorrectValue(
  value: number | null,
  solution: number[][],
  row: number,
  col: number,
) {
  return value !== null && value !== solution[row][col];
}

export function isComplete(grid: SudokuGrid, solution: number[][]) {
  return grid.every((row, rowIndex) =>
    row.every((value, colIndex) => value === solution[rowIndex][colIndex]),
  );
}

export function countErrors(grid: SudokuGrid, solution: number[][]) {
  return grid.flatMap((row, rowIndex) =>
    row.filter((value, colIndex) =>
      hasIncorrectValue(value, solution, rowIndex, colIndex),
    ),
  ).length;
}
