import { CONST } from "./GlobalVariable.js"

export default class Sudoku {
    static NUMB_ROW = 9;
    static NUMB_COL = 9;
    static NUMB_SQUARE = this.NUMB_ROW * this.NUMB_COL;
    constructor() {
        this.grid = Array(9).fill(Array(9).fill(0));
    }

    getGrid() {
        return this.grid;
    }
}