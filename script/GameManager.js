import Sudoku from "./Sudoku.js"
import SudokuGraphic from "./SudokuGraphic.js";

window.onload = () => {
    var CANVAS, SUDOKU, SUDOKU_GRAPHIC;
    const initGame = () => {
        CANVAS = document.getElementById("canvas");
        SUDOKU = new Sudoku();
        SUDOKU_GRAPHIC = new SudokuGraphic(CANVAS, SUDOKU);
        SUDOKU_GRAPHIC.clearEntireSudoku();
        SUDOKU_GRAPHIC.drawGridSudoku();
        SUDOKU_GRAPHIC.drawNumberIntoGrid();

        let mouseClick = Rx.Observable.fromEvent(CANVAS, 'click');
        let subscriber1 = mouseClick.subscribe((e) => handleMouseMoveOn(e));
    }

    const handleMouseMoveOn = (event) => {
        const pos = {
            "x": event.clientX - CANVAS.offsetLeft,
            "y": event.clientY - CANVAS.offsetTop
        };
        SUDOKU_GRAPHIC.fillColorSelectedAreaByPosition(pos);
    }


    WebFont.load({
        google: {
            families: ['Inter']
        },
        active: () => {
            initGame();
        }
    });

}