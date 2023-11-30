import { useCallback, useEffect, useState } from 'react'
import { ICoords } from '../model/coords'
import { ILevel, TBoard } from '../model/level'
import { CELL_TYPES, MOVING_TIMEOUT } from '../const'
import Board from './Board'
import styles from './Game.module.css'
import { useSecondsInterval } from '../helpers/useSecondsInterval'
import { formatTime } from '../helpers/time'
import { ILevelSolvedData } from '../model/stats'

export default function Game(props: {
    initGame: ILevel
    onWin: (turnCount: number, time: number) => void
    onFail: () => void
}) {
    const [game, setGame] = useState<ILevel>()
    const [lastSolved, setLastSolved] = useState<ILevelSolvedData>()
    const [canClick, setCanClick] = useState(true)
    const [won, setWon] = useState(false)
    const [gameOver, setGameOver] = useState(false)
    const [turns, setTurns] = useState(0)
    
    const [startTime, setStartTime] = useState(new Date().getTime())

    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(true);

    const tick = useCallback(
        () => (running ? setSeconds((seconds) => seconds + 1) : undefined),
        [running]
    );

    const start = () => setRunning(true);
    const pause = () => setRunning(false);
    const reset = () => setSeconds(0);

    const stop = () => {
        pause();
        reset();
    };

    useSecondsInterval(tick);
    
    useEffect(()=> {
        console.log('initGame changed');

        startNewGame()
    }, [props.initGame.title])

    useEffect(()=>{
        if (won) {
        setCanClick(false)
        pause()
        props.onWin(turns, seconds)
        setCanClick(false)
        }
    }, [won])

    useEffect(()=>{
        if (gameOver) {
        setCanClick(false)
        pause()
        props.onFail()
        setCanClick(false)
        }
    }, [gameOver])

    function startNewGame() {
        setGame({
            id: props.initGame.id,
            title: props.initGame.title, 
            board: props.initGame.board.map((row) => [...row]), 
            solution: props.initGame.solution,
        })
        props.initGame.solved ? setLastSolved({...props.initGame.solved}) : setLastSolved(undefined)
        setCanClick(true)
        setTurns(0)

        setStartTime(new Date().getTime())
        stop()
        reset()
        setWon(false)
        setGameOver(false)
    }

    function move(from: ICoords, to: ICoords) {
        if (game && canMove(from, to)) {
            let newBoard = [...game.board]
            // move brick
            setTurns(turns+1)
            newBoard[to.row][to.col] = game.board[from.row][from.col]
            newBoard[from.row][from.col] = CELL_TYPES.AIR
            setCanClick(false)
            processboard(newBoard)
        }
    }

    function processboard(newBoard: TBoard) {
        setTimeout(() => {
            checkBoard(newBoard)
        }, MOVING_TIMEOUT)
    }

    function checkBoard(newBoard: TBoard) {
        // fall bricks
        let falledBricks = 0
        for (let row = newBoard.length - 2; row >= 0; row--) {
            for (let col = 0; col < newBoard[row].length; col++) {
                if (
                    newBoard[row][col] !== CELL_TYPES.AIR &&
                    newBoard[row][col] !== CELL_TYPES.WALL &&
                    newBoard[row + 1][col] === CELL_TYPES.AIR
                ) {
                    newBoard[row + 1][col] = newBoard[row][col]
                    newBoard[row][col] = CELL_TYPES.AIR
                    falledBricks++
                }
            }
        }

        if (falledBricks === 0) {
            let matchedCoords: ICoords[] = []
            // mark matched bricks to
            for (let row = 0; row < newBoard.length; row++) {
                for (let col = 0; col < newBoard[row].length; col++) {
                    if (
                        newBoard[row][col] !== CELL_TYPES.AIR &&
                        newBoard[row][col] !== CELL_TYPES.WALL
                    ) {
                        if (
                            (row > 0 &&
                                newBoard[row][col] === newBoard[row - 1][col]) ||
                            (row < newBoard.length &&
                                newBoard[row][col] === newBoard[row + 1][col]) ||
                            (col > 0 &&
                                newBoard[row][col] === newBoard[row][col - 1]) ||
                            (col < newBoard[row].length &&
                                newBoard[row][col] === newBoard[row][col + 1])
                        )
                            matchedCoords.push({ row: row, col: col })
                    }
                }
            }
            game && setGame({ ...game, board: newBoard })
            if (matchedCoords.length > 0) {
                setTimeout(() => {
                    matchedCoords.forEach(
                        (matched) =>
                            (newBoard[matched.row][matched.col] = CELL_TYPES.AIR)
                    )
                    checkBoard(newBoard)
                }, MOVING_TIMEOUT * 2)
            } else {
                setCanClick(true)
                checkPairs(newBoard)
            }
        } else {
            game && setGame({ ...game, board: newBoard })
            processboard(newBoard)
        }
    }

    function checkPairs(newBoard: TBoard) {
        const blocks: Map<string, number> = new Map()
        for (let row = 0; row < newBoard.length; row++) {
            for (let col = 0; col < newBoard[row].length; col++) {
                let cellValue = newBoard[row][col]
                if (
                    cellValue !== CELL_TYPES.WALL &&
                    cellValue !== CELL_TYPES.AIR
                ) {
                    let count = blocks.get(cellValue)
                    if (count) {
                        blocks.set(cellValue, count + 1)
                    } else {
                        blocks.set(cellValue, 1)
                    }
                }
            }
        }
        
        if (blocks.size === 0) {
            setWon(true)
        } else {
            blocks.forEach((v, k) => {
                if (v < 2) {
                    if (!gameOver) setGameOver(true)
                }
            })
        }
    }

    function click(itemCoords: ICoords) {
        if (!running) start()
    }

    function canMove(from: ICoords, to: ICoords) {
        if (
            game &&
            from.row === to.row &&
            (to.col === from.col + 1 || to.col === from.col - 1)
        ) {
            if (game.board[to.row][to.col] === CELL_TYPES.AIR) {
                let clickedItem = game.board[from.row][from.col]
                if (
                    clickedItem !== CELL_TYPES.WALL &&
                    clickedItem !== CELL_TYPES.AIR
                ) {
                    return true
                }
            }
        }
        return false
    }

    return (
        <div className={styles.container}>
            { game && <>
            <h2>{game.id}. {game.title}</h2>
            { lastSolved && <p>Last Solved: Turns: {lastSolved.turn}, Time: {formatTime(lastSolved.time)}</p> }
            <Board canClick={canClick} board={game?.board} onMove={move} onClick={click} />
            <div className={styles.stats}>
                <span>Turns: {turns} / min: {game.solution.length / 2}</span>
                <span>, Time: { formatTime(seconds) }</span>
            </div>
            <div className={styles.buttonbox}>
                <button className='button' onClick={() => startNewGame()}>Re run</button>
            </div>
            </> }
        </div>
    
    )
}

