import Sudoku from "./Sudoku.js"
import { CONST } from "./GlobalVariable.js"
import SudokuGraphic from "./SudokuGraphic.js";

const initGame = () => {
    var CANVAS = document.getElementById("canvas");
    var sudokuGraphic = new SudokuGraphic(CANVAS);
    sudokuGraphic.clearEntireSudoku();
    sudokuGraphic.drawGridSudoku();

    var sudoku = new Sudoku();
    console.table(sudoku.GRID)
}


window.onload = () => {
    initGame();
}