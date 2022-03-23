import Direction from "./Direction.js";
import {
    CONST
} from "./GlobalVariable.js"
import Sudoku from "./Sudoku.js";
import Utils from "./Utils.js";

export default class SudokuGraphic {
    static BLOCK_SIZE = CONST.SQUARE_SIZE;
    static PENCIL_BLOCK_SIZE = SudokuGraphic.BLOCK_SIZE / 3;
    static GRID_SIZE = Sudoku.SIZE * SudokuGraphic.BLOCK_SIZE;
    static TEXT_SIZE = SudokuGraphic.BLOCK_SIZE * 0.7;
    static PADDING = 10;
    static SELECTED_BLOCK_ID = Utils.creatIdxObj(-1, -1);

    static STYLE = {
        thinLine: 'gray',
        thickLine: 'black',
        backGround: 'white',
        numbTextColor: '#3C5068',
        invalidNumbTextColor: '#E55C6C',
        filledNumTextColor: '#0072E3',
        selectedArea: '#E2EBF3',
        selectedBlock: '#BBDEFB',
        selectedBlockValue: '#C3D7EA',
        invalidBlock: '#F7CFD6',
        numbTextFont: `300 ${SudokuGraphic.TEXT_SIZE}px Inter`,
        numbSmallTextFont: `300 ${SudokuGraphic.TEXT_SIZE / 3}px Inter`,
    };

    constructor(canvas, sudoku) {
        this.canvas = canvas;
        this.sudoku = sudoku;
        this.autoResizeCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.isCheckingMistakes = true;
        this.isPencilMode = false;
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
        const topLeftGrid = {
            x: SudokuGraphic.PADDING / 2,
            y: SudokuGraphic.PADDING / 2
        };
        const N = Sudoku.SIZE + 1;
        const distance = SudokuGraphic.BLOCK_SIZE;

        for (let r = 0; r < N; r++) {
            this.MAP_BLOCK[r] = [];
            for (let c = 0; c < N; c++) {
                let topLeft = {
                    x: topLeftGrid.x + c * distance,
                    y: topLeftGrid.y + r * distance
                };

                let topRight = Utils.getPosByDirection(topLeft, Direction.RIGHT, distance);
                let bottomLeft = Utils.getPosByDirection(topLeft, Direction.DOWN, distance);
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
        this.ctx.fillStyle = SudokuGraphic.STYLE.backGround;
        this.ctx.fillRect(0, 0, CONST.FULL_SCREEN.w, CONST.FULL_SCREEN.h);
    }

    drawPauseScreen() {
        this.clearEntireSudoku();
        this.drawGridSudoku();
        const idx = Math.floor(Sudoku.SIZE / 2);
        const r = SudokuGraphic.BLOCK_SIZE * 0.8;
        const d = SudokuGraphic.BLOCK_SIZE * 0.2;
        console.log(r)
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#0D6EFD';
        this.ctx.arc(
            this.MAP_BLOCK[idx][idx].center.x,
            this.MAP_BLOCK[idx][idx].center.y,
            r, 0, 2 * Math.PI
        );
        this.ctx.stroke();

        this.ctx.fillStyle = '#0D6EFD';
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.strokeStyle = 'white';
        this.ctx.moveTo(this.MAP_BLOCK[idx][idx].topLeft.x + d, this.MAP_BLOCK[idx][idx].topLeft.y);
        this.ctx.lineTo(this.MAP_BLOCK[idx][idx].bottomLeft.x + d, this.MAP_BLOCK[idx][idx].bottomLeft.y);
        this.ctx.lineTo(this.MAP_BLOCK[idx][idx].topRight.x, this.MAP_BLOCK[idx][idx].center.y);
        this.ctx.lineTo(this.MAP_BLOCK[idx][idx].topLeft.x + d, this.MAP_BLOCK[idx][idx].topLeft.y);
        this.ctx.stroke();
        this.ctx.fillStyle = 'white';
        this.ctx.fill();

        SudokuGraphic.SELECTED_BLOCK_ID = {
            r: -1,
            c: -1
        };
    }

    drawPlayScreen() {
        this.clearEntireSudoku();
        this.drawGridSudoku();
        this.drawNumberIntoGrid();
        this.drawNumberIntoGridWithCheckingMistakes();
        this.drawPencilGrid();
    }

    drawGridSudoku() {
        const N = Sudoku.SIZE + 1;

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

    drawPencilBlock(idx, numb) {
        const size = SudokuGraphic.PENCIL_BLOCK_SIZE;
        const topLeft = this.MAP_BLOCK[idx.r][idx.c].topLeft;

        const topLeftAtNumb = {
            x: topLeft.x + (numb - 1) % 3 * size,
            y: topLeft.y + Math.floor((numb - 1) / 3) * size,
        }

        const center = Utils.getPosByDirection(topLeftAtNumb, Direction.DOWN_RIGHT, size / 2);

        this.drawNumberAt(numb, center, 'green', SudokuGraphic.STYLE.numbSmallTextFont);
    }

    drawPencilGrid() {
        for (let r = 0; r < Sudoku.SIZE; r++) {
            for (let c = 0; c < Sudoku.SIZE; c++) {
                const idx = Utils.creatIdxObj(r, c);
                for (const numb of this.sudoku.PENCIL_GRID[r][c]) {
                    this.drawPencilBlock(idx, numb);
                }
            }
        }
    }

    drawNumberIntoGridWithCheckingMistakes() {
        for (let r = 0; r < Sudoku.SIZE; r++) {
            for (let c = 0; c < Sudoku.SIZE; c++) {
                let style = this.isCheckingMistakes && this.sudoku.WRONG_GRID[r][c] != 0 ?
                    SudokuGraphic.STYLE.invalidNumbTextColor :
                    SudokuGraphic.STYLE.filledNumTextColor;
                this.drawNumberAtIdxBlock(r, c, this.sudoku.FILLED_GRID, style);
            }
        }
    }

    drawNumberIntoGrid(grid = this.sudoku.GRID, txtColor = SudokuGraphic.STYLE.numbTextColor) {
        for (let r = 0; r < Sudoku.SIZE; r++) {
            for (let c = 0; c < Sudoku.SIZE; c++) {
                this.drawNumberAtIdxBlock(r, c, grid, txtColor);
            }
        }
    }

    drawNumberAtIdxBlock(r, c, grid, txtColor) {
        this.drawNumberAt(grid[r][c], this.MAP_BLOCK[r][c].center, txtColor);
    }

    drawNumberAt(num, center, txtColor, font = SudokuGraphic.STYLE.numbTextFont) {
        if (num == 0) return;
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = txtColor;
        this.ctx.font = font;

        const wText = this.ctx.measureText(num).width;
        const hText = this.ctx.measureText('M').width;

        this.ctx.fillText(num, center.x - wText / 2, center.y + hText / 2, wText);
        this.ctx.stroke();
    }

    changeBlockValueAndDraw(value) {
        this.sudoku.changeBlockValueByIdx(SudokuGraphic.SELECTED_BLOCK_ID, value, this.isPencilMode);
        this.fillColorSelectedAreaByIdx(SudokuGraphic.SELECTED_BLOCK_ID);
    }

    undoAndDraw() {
        this.sudoku.revertToPrevData();
        this.fillColorSelectedAreaByIdx(SudokuGraphic.SELECTED_BLOCK_ID);
    }

    useHintAndDraw() {
        this.sudoku.useHintAt(SudokuGraphic.SELECTED_BLOCK_ID);
        this.fillColorSelectedAreaByIdx(SudokuGraphic.SELECTED_BLOCK_ID);
    }

    fillColorSelectedAreaByIdx(idx = SudokuGraphic.SELECTED_BLOCK_ID) {
        if (idx.r < 0 || idx.c < 0) return;
        this.clearEntireSudoku();
        this.fillColorBlocksInRowAndColByIdx(idx);
        this.fillColorBlocksInSubGridByIdx(idx);
        this.fillColorBlockByValue(idx);
        this.fillColorWrongBlocks();
        this.fillColorBlockByIdx(idx, SudokuGraphic.STYLE.selectedBlock);
        this.drawGridSudoku();
        this.drawNumberIntoGrid();
        this.drawNumberIntoGridWithCheckingMistakes();
        this.drawPencilGrid();
    }

    fillColorSelectedAreaByPosition(pos) {
        if (!this.isInsideGrid(pos)) return;
        const idx = this.findIdxBlockByPos(pos);
        SudokuGraphic.SELECTED_BLOCK_ID = idx;
        this.fillColorSelectedAreaByIdx(idx);
    }

    fillColorBlockByIdx(idx, fillStyle) {
        this.ctx.fillStyle = fillStyle;
        this.ctx.fillRect(
            this.MAP_BLOCK[idx.r][idx.c].topLeft.x,
            this.MAP_BLOCK[idx.r][idx.c].topLeft.y,
            SudokuGraphic.BLOCK_SIZE,
            SudokuGraphic.BLOCK_SIZE
        );
    }

    fillColorWrongBlocks(grid = this.sudoku.WRONG_GRID) {
        for (let r = 0; r < Sudoku.SIZE; r++) {
            for (let c = 0; c < Sudoku.SIZE; c++) {
                if (grid[r][c] == 0) continue;
                this.fillColorBlockByIdx(Utils.creatIdxObj(r, c), SudokuGraphic.STYLE.invalidBlock);
            }
        }
    }

    fillColorBlocksInRowAndColByIdx(idx) {
        for (let i = 0; i < Sudoku.SIZE; i++) {
            this.fillColorBlockByIdx(Utils.creatIdxObj(idx.r, i), SudokuGraphic.STYLE.selectedArea);
            this.fillColorBlockByIdx(Utils.creatIdxObj(i, idx.c), SudokuGraphic.STYLE.selectedArea);
        }
    }

    fillColorBlocksInSubGridByIdx(idx) {
        let n = Sudoku.SUB_GRID_SIZE;
        let y = Math.floor(idx.r / n);
        let x = Math.floor(idx.c / n);
        for (let i = 0; i < Sudoku.SIZE; i++) {
            let c = x * n + i % n;
            let r = y * n + Math.floor(i / n);
            this.fillColorBlockByIdx(Utils.creatIdxObj(r, c), SudokuGraphic.STYLE.selectedArea);
        }
    }

    fillColorBlockByValue(idx) {
        let grid = this.sudoku.getSolvedGrid();
        let value = grid[idx.r][idx.c];
        for (let r = 0; r < Sudoku.SIZE; r++) {
            for (let c = 0; c < Sudoku.SIZE; c++) {
                if (value == 0 || value != grid[r][c]) continue;
                this.fillColorBlockByIdx(Utils.creatIdxObj(r, c), SudokuGraphic.STYLE.selectedBlockValue);
            }
        }
    }

    isInsideGrid(pos) {
        return Utils.isInsideSquare(pos, this.MAP_BLOCK[0][0].topLeft, SudokuGraphic.GRID_SIZE);
    }

    findColIdxBlockByPos(pos) {
        for (let i = 0; i < Sudoku.SIZE; i++) {
            if (pos.x > this.MAP_BLOCK[0][i].topLeft.x &&
                pos.x < this.MAP_BLOCK[0][i].topRight.x) {
                return i;
            }
        }
        return -1;
    }

    findRowIdxBlockByPos(pos) {
        for (let i = 0; i < Sudoku.SIZE; i++) {
            if (pos.y > this.MAP_BLOCK[i][0].topLeft.y &&
                pos.y < this.MAP_BLOCK[i][0].bottomLeft.y) {
                return i;
            }
        }
        return -1;
    }

    findIdxBlockByPos(pos) {
        return Utils.creatIdxObj(
            this.findRowIdxBlockByPos(pos),
            this.findColIdxBlockByPos(pos)
        );
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

    enableCheckingMistakes(enable) {
        this.isCheckingMistakes = enable;
    }

    enablePencilMode(enable) {
        this.isPencilMode = enable;
    }
}