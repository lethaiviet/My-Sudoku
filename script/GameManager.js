import Sudoku from "./Sudoku.js"
import SudokuGraphic from "./SudokuGraphic.js";

window.onload = () => {
    var CANVAS, SUDOKU, SUDOKU_GRAPHIC, LEVEL;
    const isLoading$ = new Rx.BehaviorSubject(true);
    const levelGame$ = new Rx.BehaviorSubject(1);

    const initGame = () => {
        console.count("initGame");
        CANVAS = document.querySelector("#canvas");
        LEVEL = document.querySelector("#level-game");

        const mouseClick$ = Rx.Observable.fromEvent(CANVAS, 'click');
        mouseClick$.subscribe((e) => handleMouseMoveOn(e));

        const selectLevel$ = Rx.Observable.fromEvent(LEVEL, 'change');
        selectLevel$.subscribe((e) => {
            isLoading$.next(true);

            //Set time out = 50ms to avoid initSudoku func block render/repair the splash screen. 
            setTimeout(() => levelGame$.next(e.target.value), 50);
        });

        isLoading$.subscribe((value) => {
            showLoading(value);
        });

        levelGame$.subscribe((level) => {
            initSudoku(level);
            isLoading$.next(false);
        });
    }

    const initSudoku = (level = 1) => {
        console.count(`initSudoku ${level}`);
        SUDOKU = new Sudoku(level);
        SUDOKU_GRAPHIC = new SudokuGraphic(CANVAS, SUDOKU);
        SUDOKU_GRAPHIC.clearEntireSudoku();
        SUDOKU_GRAPHIC.drawGridSudoku();
        SUDOKU_GRAPHIC.drawNumberIntoGrid();
    }

    const handleMouseMoveOn = (event) => {
        const pos = {
            "x": event.clientX - CANVAS.offsetLeft,
            "y": event.clientY - CANVAS.offsetTop
        };
        SUDOKU_GRAPHIC.fillColorSelectedAreaByPosition(pos);
    }

    const showLoading = (isEnabled) => {
        const style = isEnabled ? 'block' : 'none';
        document.getElementById("splash-screen").style.display = style;
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