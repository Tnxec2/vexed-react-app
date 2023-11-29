import { useEffect, useState } from 'react'
import { ICoords } from '../model/coords'
import { ILevel, TBoard } from '../model/level'
import { CELL_TYPES, MOVING_TIMEOUT } from '../const'
import Board from './Board'
import styles from './Game.module.css'

export default function Game(props: {
    initGame: ILevel
    onWin: () => void
    onFail: () => void
}) {
    const [game, setGame] = useState<ILevel>()
    const [canClick, setCanClick] = useState(true)

    useEffect(()=> {
        startNewGame()
    }, [props.initGame])

    function startNewGame() {
        setGame({title: props.initGame.title, board: props.initGame.board.map((row) => [...row]), solution: props.initGame.solution})
        setCanClick(true)
    }

    function move(from: ICoords, to: ICoords) {
        if (game && canMove(from, to)) {
            let newBoard = [...game.board]
            // move brick
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
            won()
        } else {
            setCanClick(true)
            blocks.forEach((v, k) => {
                if (v < 2) {
                    gameOver()
                }
            })
        }
    }

    function won() {
        props.onWin()
        setCanClick(false)
    }

    function gameOver() {
        props.onFail()
        setCanClick(false)
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
            { game && <><h2>{game.title}</h2>
            <Board canClick={canClick} board={game?.board} onMove={move} />
            <div className={styles.buttonbox}>
                <button className='button' onClick={() => startNewGame()}>Re run</button>
            </div>
            </> }
        </div>
    
    )
}
