import {
    CONST
} from './GlobalVariable.js'
import Utils from './Utils.js';

export default class Sudoku {
    static SIZE = 9;
    static SUB_GRID_SIZE = 3;
    static NUMB_SQUARES = this.SIZE * this.SIZE;
    constructor(level) {
        this.COUNT = 0;
        this.GRID = [];
        this.FILLED_GRID = [];
        this.WRONG_GRID = [];
        this.BLOCK_STACK = [];
        this.generateLevelSudoku(level);
        this.createZeroGrid(this.FILLED_GRID);
        this.createZeroGrid(this.WRONG_GRID);
    }

    createZeroGrid(grid = this.GRID) {
        for (let i = 0; i < Sudoku.SIZE; i++) {
            grid[i] = Array(Sudoku.SIZE).fill(0);
        }
    }

    fillRandomValueIntoGrid() {
        let row, col;
        for (let i = 0; i < Sudoku.NUMB_SQUARES; i++) {
            row = Math.floor(i / Sudoku.SIZE);
            col = i % Sudoku.SIZE;

            if (this.GRID[row][col] != 0) continue;

            for (const value of Utils.getRandomNumbsFromOneToNine()) {
                //check value do not exist in row
                if (this.GRID[row].includes(value)) continue;

                //check value do not exist in col
                if (Utils.checkValueExistAtCol(this.GRID, col, value)) continue;

                //check value do not exist SubGrid - 3x3 square
                let subGrid = this.getSubGridAt(
                    Math.floor(col / Sudoku.SUB_GRID_SIZE),
                    Math.floor(row / Sudoku.SUB_GRID_SIZE)
                );
                if (subGrid.includes(value)) continue;

                this.GRID[row][col] = value;
                if (this.isFullGrid())
                    return true;
                else {
                    if (this.fillRandomValueIntoGrid())
                        return true;
                }
            }

            break;
        }
        this.GRID[row][col] = 0;
    }

    generateLevelSudoku(level = 1) {
        this.createZeroGrid();
        this.fillRandomValueIntoGrid();

        while (level > 0) {
            let col = Utils.randomIntFromInterval(0, 8);
            let row = Utils.randomIntFromInterval(0, 8);

            if (this.GRID[row][col] == 0) continue;
            let backup = this.GRID[row][col];

            this.GRID[row][col] = 0;

            let gridCopy = Utils.clone(this.GRID);

            this.COUNT = 0;
            this.solveSudoku(gridCopy);

            if (this.COUNT != 1) {
                this.GRID[row][col] = backup;
                level--;
            }
        }
    }

    solveSudoku(grid) {
        let row, col;
        for (let i = 0; i < Sudoku.NUMB_SQUARES; i++) {
            row = Math.floor(i / Sudoku.SIZE);
            col = i % Sudoku.SIZE;

            if (grid[row][col] != 0) continue;

            for (const value of CONST.NUMBS) {
                //check value do not exist in row
                if (grid[row].includes(value)) continue;

                //check value do not exist in col
                if (Utils.checkValueExistAtCol(grid, col, value)) continue;

                //check value do not exist SubGrid - 3x3 square
                let subGrid = this.getSubGridAt(
                    Math.floor(col / Sudoku.SUB_GRID_SIZE),
                    Math.floor(row / Sudoku.SUB_GRID_SIZE),
                    grid
                );

                if (subGrid.includes(value)) continue;

                grid[row][col] = value;
                if (this.isFullGrid(grid)) {
                    this.COUNT++;
                    break;
                } else {
                    if (this.solveSudoku(grid)) return true;
                }
            }
            break;
        }
        grid[row][col] = 0;
    }

    isFullGrid(grid = this.GRID) {
        for (let r = 0; r < Sudoku.SIZE; r++) {
            for (let c = 0; c < Sudoku.SIZE; c++) {
                if (grid[r][c] == 0) return false;
            }
        }
        return true;
    }

    getSubGridAt(x, y, grid = this.GRID) {
        let arr = [];
        for (let i = 0; i < Sudoku.SIZE; i++) {
            let c = x * Sudoku.SUB_GRID_SIZE + i % Sudoku.SUB_GRID_SIZE;
            let r = y * Sudoku.SUB_GRID_SIZE + Math.floor(i / Sudoku.SUB_GRID_SIZE);
            arr[i] = grid[r][c];
        }
        return arr;
    }

    changeBlockValueByIdx(idx, value) {
        if (idx.r < 0 || idx.c < 0 || this.GRID[idx.r][idx.c] != 0) return;
        this.FILLED_GRID[idx.r][idx.c] = this.FILLED_GRID[idx.r][idx.c] == value ? 0 : value;
        this.updateWrongGridByAllFilledBlocks();
    }

    updateWrongGridByFilledBlock = (idx, value) => {
        const invalidBlocks = this.getAllInvalidBlocksByFilledBlock(idx, value);
        for (const block of invalidBlocks) {
            this.WRONG_GRID[block.r][block.c] = value;
        }
    }

    updateWrongGridByAllFilledBlocks = () => {
        this.createZeroGrid(this.WRONG_GRID);
        for (let r = 0; r < Sudoku.SIZE; r++) {
            for (let c = 0; c < Sudoku.SIZE; c++) {
                if (this.FILLED_GRID[r][c] == 0) continue;
                this.updateWrongGridByFilledBlock(Utils.creatIdxObj(r, c), this.FILLED_GRID[r][c]);
            }
        }
    }

    checkColsAndRowsSudoku() {
        const grid = Utils.mergeMatrix(this.GRID, this.FILLED_GRID);
        for (let i = 0; i < 9; i++) {
            let row = grid[i];
            let col = grid.map(val => val[i]);

            if (checkDuplicatedValueInArray(row) ||
                checkDuplicatedValueInArray(col))
                return false;
        }
        return true;
    }

    getAllInvalidBlocksByFilledBlock(idx, value) {
        const grid = this.getSolvedGrid();
        const list1 = this.getAllInvalidBlockOnColAndRowByFilledBlock(grid, idx, value);
        const list2 = this.getAllInvalidBlockOnSubGridByFilledBlock(grid, idx, value);
        return [...new Set([...list1, ...list2])];
    }

    getAllInvalidBlockOnColAndRowByFilledBlock(grid, idx, value) {
        let list = [];
        for (let i = 0; i < Sudoku.SIZE; i++) {
            if (i != idx.c && grid[idx.r][i] == value) list.push(Utils.creatIdxObj(idx.r, i));
            if (i != idx.r && grid[i][idx.c] == value) list.push(Utils.creatIdxObj(i, idx.c));
        }

        if (list.length != 0) list.push(idx);
        return list;
    }

    getAllInvalidBlockOnSubGridByFilledBlock(grid, idx, value) {
        let list = [];
        const x = Math.floor(idx.c / Sudoku.SUB_GRID_SIZE);
        const y = Math.floor(idx.r / Sudoku.SUB_GRID_SIZE);

        for (let i = 0; i < Sudoku.SIZE; i++) {
            let c = x * Sudoku.SUB_GRID_SIZE + i % Sudoku.SUB_GRID_SIZE;
            let r = y * Sudoku.SUB_GRID_SIZE + Math.floor(i / Sudoku.SUB_GRID_SIZE);
            if ((r != idx.r && c != idx.c) && grid[r][c] == value) list.push(Utils.creatIdxObj(r, c));
        }

        if (list.length != 0) list.push(idx);
        return list;
    }

    getSolvedGrid() {
        return Utils.mergeMatrix(this.GRID, this.FILLED_GRID);
    }
}