export type Difficulty = "easy" | "medium" | "hard";

export type CellValue = number | null;

export type SudokuGrid = CellValue[][];

export type Puzzle = {
  id: string;
  difficulty: Difficulty;
  title: string;
  puzzle: SudokuGrid;
  solution: number[][];
};
