import Sudoku from "./Sudoku.js"
import { CONST } from "./GlobalVariable.js"
import SudokuGraphic from "./SudokuGraphic.js";

const initGame = () => {
    const CANVAS = document.getElementById("canvas");
    const sudoku = new Sudoku();
    const sudokuGraphic = new SudokuGraphic(CANVAS, sudoku);
    sudokuGraphic.clearEntireSudoku();
    sudokuGraphic.drawNumberIntoGrid();
    sudokuGraphic.drawGridSudoku();


    console.table(sudoku.GRID)
}


window.onload = () => {
    initGame();
}