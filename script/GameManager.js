import Sudoku from "./Sudoku.js"
import SudokuGraphic from "./SudokuGraphic.js";
import Utils from "./Utils.js";
const {
    BehaviorSubject,
    fromEvent,
    merge,
    empty,
    interval,
    NEVER,
    publish
} = rxjs;

const {
    mapTo,
    scan,
    startWith,
    switchMap,
    tap
} = rxjs.operators;

window.onload = () => {
    var CANVAS, LEVEL, PLAY_PAUSE_BTN;
    var SUDOKU, SUDOKU_GRAPHIC;

    const isLoading$ = new BehaviorSubject(true);
    const levelGame$ = new BehaviorSubject(1);

    const initGame = () => {
        CANVAS = document.querySelector("#canvas");
        LEVEL = document.querySelector("#level-game");
        PLAY_PAUSE_BTN = document.querySelector("#play-pause-btn");
        initAllEventsInGame();
    }

    const initAllEventsInGame = () => {
        initClickOnGridSudokuEvent();
        initShowLoadingEvent();
        initSelectLevelEvent();
        initWatchStopEvent();
    }

    const initWatchStopEvent = () => {
        const eventStopWatch$ = merge(
            fromClickToMap("play-pause-btn", {
                typeEvent: "click-on-toggle"
            }),

            levelGame$.pipe(mapTo({
                typeEvent: "select-dropdown",
                count: true,
                value: 0
            }))
        );

        const stopWatch$ = eventStopWatch$.pipe(
            startWith({
                count: true,
                speed: 1000,
                value: 0
            }),
            scan((state, curr) => {
                state = {...state,
                    ...curr
                };
                if (state.typeEvent == "click-on-toggle") {
                    state.count = !state.count;
                } else {
                    state.count = true;
                }

                return state;
            }, {}),
            tap(state => {
                setIconPlayPauseBtn(state.count);
                setValueWatchStop(state.value)
            }),
            switchMap(state => state.count ? interval(1000).pipe(
                tap(() => state.value += 1),
                tap(() => setValueWatchStop(state.value))
            ) : NEVER)
        );
        stopWatch$.subscribe();
    }

    const initSelectLevelEvent = () => {
        const selectLevel$ = fromEvent(LEVEL, 'change');
        selectLevel$.subscribe((e) => {
            isLoading$.next(true);

            //Set time out = 50ms to avoid initSudoku func block render/repair the splash screen. 
            setTimeout(() => levelGame$.next(e.target.value), 50);
        });

        levelGame$.subscribe((level) => {
            initSudoku(level);
            isLoading$.next(false);
        });
    }

    const initClickOnGridSudokuEvent = () => {
        const fromClickOnSudokuGrid$ = fromEvent(CANVAS, 'click');
        fromClickOnSudokuGrid$.subscribe((e) => handleClickOnSudokuGrid(e));
    }

    const initShowLoadingEvent = () => {
        isLoading$.subscribe((value) => {
            showLoading(value);
        });
    }

    const initSudoku = (level = 1) => {
        SUDOKU = new Sudoku(level);
        SUDOKU_GRAPHIC = new SudokuGraphic(CANVAS, SUDOKU);
        SUDOKU_GRAPHIC.clearEntireSudoku();
        SUDOKU_GRAPHIC.drawGridSudoku();
        SUDOKU_GRAPHIC.drawNumberIntoGrid();
    }

    const handleClickOnSudokuGrid = (event) => {
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

    const fromClick = (id) => fromEvent(document.getElementById(id), 'click');

    const fromClickToMap = (id, obj) => fromClick(id).pipe(mapTo(obj));

    const setValueWatchStop = (value) => {
        document.querySelector("#timer").innerHTML = Utils.formatSeconds(value);
    }

    const setIconPlayPauseBtn = (isCounting) => {
        const attribute = isCounting ? "fa fa-pause" : "fa fa-play";
        PLAY_PAUSE_BTN.querySelector("i").setAttribute("class", attribute);
    }

    const isCounting = () => {
        const typeBtn = PLAY_PAUSE_BTN.querySelector("i").className;
        console.log(`isCounting: ${typeBtn == "fa fa-pause"}`)
        return typeBtn == "fa fa-pause";
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