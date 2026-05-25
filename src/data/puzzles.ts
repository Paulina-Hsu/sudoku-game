import type { Difficulty, Puzzle, SudokuGrid } from "@/types/sudoku";

export const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "簡單" },
  { value: "medium", label: "中等" },
  { value: "hard", label: "困難" },
];

const solvedA = [
  "534678912",
  "672195348",
  "198342567",
  "859761423",
  "426853791",
  "713924856",
  "961537284",
  "287419635",
  "345286179",
];

const solvedB = [
  "145327698",
  "839654127",
  "672918543",
  "496185372",
  "218473956",
  "753296481",
  "367542819",
  "984761235",
  "521839764",
];

const solvedC = [
  "987654321",
  "246173985",
  "351928746",
  "128537694",
  "634892157",
  "795461832",
  "519286473",
  "472319568",
  "863745219",
];

function toSolution(rows: string[]) {
  return rows.map((row) => row.split("").map(Number));
}

function toPuzzle(solutionRows: string[], maskRows: string[]): SudokuGrid {
  return solutionRows.map((row, rowIndex) =>
    row
      .split("")
      .map((value, colIndex) =>
        maskRows[rowIndex][colIndex] === "1" ? Number(value) : null,
      ),
  );
}

function createPuzzle(
  id: string,
  difficulty: Difficulty,
  title: string,
  solutionRows: string[],
  maskRows: string[],
): Puzzle {
  return {
    id,
    difficulty,
    title,
    puzzle: toPuzzle(solutionRows, maskRows),
    solution: toSolution(solutionRows),
  };
}

export const puzzles: Record<Difficulty, Puzzle[]> = {
  easy: [
    createPuzzle("easy-1", "easy", "晨間暖身", solvedA, [
      "110010000",
      "100111000",
      "011000010",
      "100010001",
      "100101001",
      "100010001",
      "010000110",
      "000111001",
      "000010011",
    ]),
    createPuzzle("easy-2", "easy", "午後小局", solvedB, [
      "101101101",
      "110001100",
      "010010010",
      "100101001",
      "011010110",
      "100101001",
      "010010010",
      "001100011",
      "101101101",
    ]),
    createPuzzle("easy-3", "easy", "輕鬆九宮", solvedC, [
      "010010010",
      "001101100",
      "110010011",
      "000111000",
      "101000101",
      "000111000",
      "110010011",
      "001101100",
      "010010010",
    ]),
  ],
  medium: [
    createPuzzle("medium-1", "medium", "穩定推理", solvedA, [
      "000110101",
      "110010010",
      "110001100",
      "110100010",
      "001101100",
      "010001011",
      "001100011",
      "010010011",
      "101011000",
    ]),
    createPuzzle("medium-2", "medium", "交叉線索", solvedB, [
      "010101000",
      "110001100",
      "000010000",
      "110000100",
      "100000001",
      "001000011",
      "000010000",
      "001100011",
      "000101010",
    ]),
    createPuzzle("medium-3", "medium", "均衡挑戰", solvedC, [
      "000100100",
      "100001100",
      "000011010",
      "000000000",
      "010110001",
      "000101011",
      "010100010",
      "101000000",
      "010000100",
    ]),
  ],
  hard: [
    createPuzzle("hard-1", "hard", "深水區", solvedA, [
      "000010010",
      "100100001",
      "011000100",
      "000000100",
      "000101000",
      "100010001",
      "010000110",
      "100001001",
      "000010010",
    ]),
    createPuzzle("hard-2", "hard", "極簡線索", solvedB, [
      "001100000",
      "100000010",
      "010010100",
      "100001100",
      "010010001",
      "001100010",
      "010100001",
      "001000010",
      "000001100",
    ]),
    createPuzzle("hard-3", "hard", "最後一哩", solvedC, [
      "000000000",
      "000001011",
      "001010000",
      "000101000",
      "001000100",
      "010000000",
      "100000011",
      "001010000",
      "000010001",
    ]),
  ],
};
