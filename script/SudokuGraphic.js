import Direction from "./Direction.js";
import { CONST } from "./GlobalVariable.js"
import Sudoku from "./Sudoku.js";
import Utils from "./Utils.js";

export default class SudokuGraphic {
    static BLOCK_SIZE = CONST.SQUARE_SIZE;
    static GRID_SIZE = Sudoku.NUMB_ROW * SudokuGraphic.BLOCK_SIZE;
    static PADDING = 10;
    static STYLE = {
        thinLine: 'gray',
        thickLine: 'black'
    };

    constructor(canvas) {
        this.canvas = canvas;
        this.autoResizeCanvas();
        this.ctx = this.canvas.getContext('2d');

        //MAP_BLOCK contains all the vertices of block
        //Ex: MAP_BLOCK[0][0].topLeft.x is the x coordinate top left of the block at (0,0)
        this.MAP_BLOCK = [];
        this.initMapBlock();
    }

    autoResizeCanvas() {
        this.canvas.width = SudokuGraphic.GRID_SIZE + SudokuGraphic.PADDING;
        this.canvas.height = this.canvas.width;
    }

    initMapBlock() {
        const topLeftGrid = { x: SudokuGraphic.PADDING / 2, y: SudokuGraphic.PADDING / 2 };
        const N = Sudoku.NUMB_ROW + 1;
        const distance = SudokuGraphic.BLOCK_SIZE;

        for (let r = 0; r < N; r++) {
            this.MAP_BLOCK[r] = [];
            for (let c = 0; c < N; c++) {
                let topLeft = {
                    x: topLeftGrid.x + c * distance,
                    y: topLeftGrid.y + r * distance
                };

                let topRight = Utils.getPosByDirection(topLeft, Direction.RIGHT, distance);
                let bottomLeft = Utils.getPosByDirection(topLeft, Direction.DOWN_LEFT, distance);
                let bottomRight = Utils.getPosByDirection(topLeft, Direction.DOWN_RIGHT, distance);
                let center = Utils.getPosByDirection(topLeft, Direction.DOWN_RIGHT, distance * 0.5);

                this.MAP_BLOCK[r][c] = {
                    topLeft: topLeft,
                    topRight: topRight,
                    bottomLeft: bottomLeft,
                    bottomRight: bottomRight,
                    center: center
                }
            }
        }
    }

    clearEntireSudoku() {
        this.ctx.clearRect(
            this.MAP_BLOCK[0][0].topLeft.x,
            this.MAP_BLOCK[0][0].topLeft.y,
            SudokuGraphic.GRID_SIZE,
            SudokuGraphic.GRID_SIZE
        );
    }

    drawBackGround() {
        this.ctx.fillStyle = 'yellow';
        this.ctx.fillRect(0, 0, CONST.FULL_SCREEN.w, CONST.FULL_SCREEN.h);
    }

    drawGridSudoku() {
        const N = Sudoku.NUMB_ROW + 1;

        for (let i = 0; i < N; i++) {
            this.ctx.beginPath();

            (i % 3 == 0) ? this.setThickLineStyle(): this.setThinLineStyle();

            this.ctx.moveTo(this.MAP_BLOCK[i][0].topLeft.x, this.MAP_BLOCK[i][0].topLeft.y);
            this.ctx.lineTo(this.MAP_BLOCK[i][9].topLeft.x, this.MAP_BLOCK[i][9].topLeft.y);
            this.ctx.stroke();

            this.ctx.moveTo(this.MAP_BLOCK[0][i].topLeft.x, this.MAP_BLOCK[0][i].topLeft.y);
            this.ctx.lineTo(this.MAP_BLOCK[9][i].topLeft.x, this.MAP_BLOCK[9][i].topLeft.y);
            this.ctx.stroke();
        }
    }

    setThinLineStyle() {
        this.ctx.strokeStyle = SudokuGraphic.STYLE.thinLine;
        this.ctx.setLineDash([5, 5]);
        this.ctx.lineWidth = 1;
    }

    setThickLineStyle() {
        this.ctx.strokeStyle = SudokuGraphic.STYLE.thickLine;
        this.ctx.setLineDash([]);
        this.ctx.lineWidth = 2;
    }
}