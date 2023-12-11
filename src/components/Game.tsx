import { useCallback, useEffect, useState } from 'react'
import { ICoords } from '../model/coords'
import { ILevel, TBoard } from '../model/level'
import { CELL_TYPES, MOVING_TIMEOUT } from '../const'
import Board from './Board'
import styles from './Game.module.css'
import { useSecondsInterval } from '../helpers/useSecondsInterval'
import { formatTime } from '../helpers/time'
import { ILevelSolvedData } from '../model/stats'
import { IMove, MoveTypes } from '../model/move'

export default function Game(props: {
    initGame: ILevel
    onWin: (turnCount: number, time: number) => void
    onFail: () => void
    onSelectLevel: () => void
}) {
    const [game, setGame] = useState<ILevel>()
    const [lastSolved, setLastSolved] = useState<ILevelSolvedData>()
    const [canClick, setCanClick] = useState(true)
    const [won, setWon] = useState(false)
    const [gameOver, setGameOver] = useState(false)
    const [turns, setTurns] = useState(0)

    const [seconds, setSeconds] = useState(0)
    const [running, setRunning] = useState(true)

    const [inSolution, setInSolution] = useState(false)

    const [moves, setMoves] = useState<IMove[]>([])

    const [movesSolution, setMovesSolution] = useState<IMove[]>([])
    const [boardSolution, setBoardSolution] = useState<TBoard>([])
    const [solutionMove, setSolutionMove] = useState<number>(0)

    const tick = useCallback(
        () => (running ? setSeconds((seconds) => seconds + 1) : undefined),
        [running]
    )

    const start = () => setRunning(true)
    const pause = () => setRunning(false)
    const reset = () => setSeconds(0)

    const stop = () => {
        pause()
        reset()
    }

    useSecondsInterval(tick)

    useEffect(() => {
        console.log('initGame changed')

        startNewGame()
    }, [props.initGame.title])

    useEffect(() => {
        if (won) {
            setCanClick(false)
            pause()
            props.onWin(turns, seconds)
            setCanClick(false)
        }
    }, [won])

    useEffect(() => {
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
        props.initGame.solved
            ? setLastSolved({ ...props.initGame.solved })
            : setLastSolved(undefined)
        setCanClick(true)
        setTurns(0)
        setMoves([])
        
        stop()
        reset()
        setWon(false)
        setGameOver(false)
        setInSolution(false)
    }

    function move(from: ICoords, to: ICoords) {
        if (game && canMove(from, to)) {
            let newBoard = inSolution ? [...boardSolution] : [...game.board]
            let newMoves = inSolution ? [...movesSolution] : [...moves]
            // move brick
            if (!inSolution) setTurns(turns + 1)
            else setSolutionMove(solutionMove + 1)
            newMoves.push({
                from: from,
                to: to,
                typeMove: from.col < to.col ? MoveTypes.RIGHT : MoveTypes.LEFT,
                typeTile: inSolution
                    ? boardSolution[from.row][from.col]
                    : game.board[from.row][from.col],
            })

            newBoard[to.row][to.col] = inSolution
                ? boardSolution[from.row][from.col]
                : game.board[from.row][from.col]
            newBoard[from.row][from.col] = CELL_TYPES.AIR
            setCanClick(false)
            processboard(newBoard, newMoves)
        }
    }

    function back() {
        if (!game || (moves.length === 0 && movesSolution.length === 0)) return
        let newMoves = inSolution ? [...movesSolution] : [...moves]
        let newBoard = inSolution ? [...boardSolution] : [...game.board]
        let lastMove = newMoves.pop()
        let process = true
        while (process) {
            if (lastMove) {
                switch (lastMove.typeMove) {
                    case MoveTypes.ERASE:
                        newBoard[lastMove.from.row][lastMove.from.col] =
                            lastMove.typeTile
                        break
                    case MoveTypes.DOWN:
                    case MoveTypes.LEFT:
                    case MoveTypes.RIGHT:
                        newBoard[lastMove.from.row][lastMove.from.col] =
                            lastMove.typeTile
                        newBoard[lastMove.to.row][lastMove.to.col] =
                            CELL_TYPES.AIR
                        break
                    default:
                        break
                }
            }

            process =
                lastMove !== undefined &&
                lastMove.typeMove !== MoveTypes.LEFT &&
                lastMove.typeMove !== MoveTypes.RIGHT

            if (process) lastMove = newMoves.pop()
        }
        if (inSolution) {
            setBoardSolution([...newBoard])
            setMovesSolution([...newMoves])
            setSolutionMove(solutionMove - 1)
        } else {
            setGame({ ...game, board: newBoard })
            setMoves([...newMoves])
            setTurns(turns - 1)
        }
    }

    function processboard(newBoard: TBoard, newMoves: IMove[]) {
        setTimeout(() => {
            checkBoard(newBoard, newMoves)
        }, MOVING_TIMEOUT)
    }

    function checkBoard(newBoard: TBoard, newMoves: IMove[]) {
        // fall bricks
        let falledBricks = 0
        for (let row = newBoard.length - 2; row >= 0; row--) {
            for (let col = 0; col < newBoard[row].length; col++) {
                if (
                    newBoard[row][col] !== CELL_TYPES.AIR &&
                    newBoard[row][col] !== CELL_TYPES.WALL &&
                    newBoard[row + 1][col] === CELL_TYPES.AIR
                ) {
                    newMoves.push({
                        from: { row: row, col: col },
                        to: { row: row + 1, col: col },
                        typeMove: MoveTypes.DOWN,
                        typeTile: newBoard[row][col],
                    })
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
                                newBoard[row][col] ===
                                    newBoard[row - 1][col]) ||
                            (row < newBoard.length &&
                                newBoard[row][col] ===
                                    newBoard[row + 1][col]) ||
                            (col > 0 &&
                                newBoard[row][col] ===
                                    newBoard[row][col - 1]) ||
                            (col < newBoard[row].length &&
                                newBoard[row][col] === newBoard[row][col + 1])
                        )
                            matchedCoords.push({ row: row, col: col })
                    }
                }
            }
            if (inSolution) {
                setBoardSolution([...newBoard])
                setMovesSolution([...newMoves])
            } else {
                game && setGame({ ...game, board: newBoard })
                setMoves([...newMoves])
            }
            if (matchedCoords.length > 0) {
                setTimeout(() => {
                    matchedCoords.forEach((matched) => {
                        newMoves.push({
                            from: { row: matched.row, col: matched.col },
                            to: { row: matched.row, col: matched.col },
                            typeMove: MoveTypes.ERASE,
                            typeTile: newBoard[matched.row][matched.col],
                        })
                        newBoard[matched.row][matched.col] = CELL_TYPES.AIR
                    })
                    checkBoard(newBoard, newMoves)
                }, MOVING_TIMEOUT * 2)
            } else {
                setCanClick(true)
                !inSolution && checkPairs(newBoard)
            }
        } else {
            if (inSolution) {
                setBoardSolution([...newBoard])
                setMovesSolution([...newMoves])
            } else {
                game && setGame({ ...game, board: newBoard })
                setMoves([...newMoves])
            }
            processboard(newBoard, newMoves)
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
            if (
                (!inSolution &&
                    game.board[to.row][to.col] === CELL_TYPES.AIR) ||
                (inSolution && boardSolution[to.row][to.col] === CELL_TYPES.AIR)
            ) {
                let clickedItem = inSolution
                    ? boardSolution[from.row][from.col]
                    : game.board[from.row][from.col]
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

    function toggleSolutionMode() {
        if (!game) return

        if (!inSolution) {
            setMovesSolution([])
            setBoardSolution(props.initGame.board.map((row) => [...row]))
            setSolutionMove(0)
            pause()
        } else {
            start()
            setCanClick(true)
        }

        setInSolution(!inSolution)
    }

    function next() {
        if (!game) return
        let count = game.solution.length
        if (solutionMove * 2 >= count) {
            toggleSolutionMode()
            return
        }
        // Get the move
        let chX = game.solution.charCodeAt(solutionMove * 2)
        let chY = game.solution.charCodeAt(solutionMove * 2 + 1)

        let x = chX - 'a'.charCodeAt(0)
        let direction = -1
        if (chX <= 'Z'.charCodeAt(0)) {
            direction = -1
            x = chX - 'A'.charCodeAt(0)
        }
        let y = chY - 'a'.charCodeAt(0)
        if (chY <= 'Z'.charCodeAt(0)) {
            direction = 1
            y = chY - 'A'.charCodeAt(0)
        }

        move({ row: y, col: x }, { row: y, col: x + direction })
    }

    return (
        <div className={styles.container}>
            {game && (
                <>
                    <h2>
                        {game.id}. {game.title}
                        <button
                            type="button"
                            className="button ms-3"
                            onClick={() => props.onSelectLevel()}
                        >
                            Select Level
                        </button>
                    </h2>
                    {lastSolved && (
                        <p>
                            Last Solved: Turns: {lastSolved.turn}, Time:{' '}
                            {formatTime(lastSolved.time)}
                        </p>
                    )}
                    <Board
                        canClick={!inSolution && canClick}
                        board={inSolution ? boardSolution : game?.board}
                        onMove={move}
                        onClick={click}
                    />

                    {inSolution ? (
                        <div className={styles.stats}>
                            <h2>
                                Solution, move: {solutionMove} from{' '}
                                {game.solution.length / 2}
                            </h2>
                        </div>
                    ) : (
                        <div className={styles.stats}>
                            <span>
                                Turns: {turns} / min: {game.solution.length / 2}
                            </span>
                            <span>
                                , Time: {formatTime(seconds)}{' '}
                                {running ? '⏳' : ''}
                            </span>
                        </div>
                    )}
                    <div className={styles.buttonbox}>
                        {
                            <button
                                type="button"
                                className="button me-3"
                                onClick={() => back()}
                                title="Undo last move"
                                disabled={
                                    (!inSolution && (!turns || !canClick)) ||
                                    (inSolution && (!solutionMove || !canClick))
                                }
                            >
                                {inSolution ? 
                                <span>
                                    <img src='assets/icons/iconmonstr-arrow-left.svg' className='icon' alt='Back'></img>
                                </span>
                                : 
                                <span>
                                    <img src='assets/icons/iconmonstr-undo.svg' className='icon' alt='Undo'></img>
                                </span>
                                }
                            </button>
                        }
                        {inSolution && (
                            <button
                                type="button"
                                className="button me-3"
                                onClick={() => next()}
                                title="Next solution turn"
                                disabled={
                                    solutionMove >= game.solution.length / 2 ||
                                    !canClick
                                }
                            >
                                <span>
                                    <img src='assets/icons/iconmonstr-arrow-next.svg' className='icon' alt='Next'></img>
                                </span>
                            </button>
                        )}
                        {
                            <button
                                type="button"
                                className="button"
                                onClick={() => startNewGame()}
                                title="Restart game"
                            >
                                <span>
                                    <img src='assets/icons/iconmonstr-refresh.svg' className='icon' alt='Restart game'></img>
                                    Restart
                                </span>
                                
                            </button>
                        }
                        {
                            <button
                                type="button"
                                className="button ms-3"
                                onClick={() => toggleSolutionMode()}
                                title="Toggle solution"
                                disabled={!inSolution && !canClick}
                            >
                                {inSolution
                                    ? 
                                    <span>
                                        <img src='assets/icons/iconmonstr-undo.svg' className='icon' alt='Undo'></img>
                                        back to game
                                    </span>
                                    : 
                                    <span>
                                    <img src='assets/icons/iconmonstr-idea.svg' className='icon' alt='Next'></img>
                                    show solution
                                </span>
                                }
                            </button>
                        }
                    </div>
                </>
            )}
        </div>
    )
}
