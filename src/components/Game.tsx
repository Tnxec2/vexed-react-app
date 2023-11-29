import { useState } from 'react'
import { ICoords } from '../model/coords'
import { ILevel, TBoard } from '../model/level'
import { CELL_TYPES, MOVING_TIMEOUT } from '../const'
import Board from './Board'

export default function Game(props: { initGame: ILevel }) {
    const [game, setGame] = useState(props.initGame)
    const [canClick, setCanClick] = useState(true)

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

        // save board
        setGame({ ...game, board: newBoard })

        if (matchedCoords.length > 0) {
            setTimeout(() => {
                matchedCoords.forEach(
                    (matched) =>
                        (newBoard[matched.row][matched.col] = CELL_TYPES.AIR)
                )
                checkBoard(newBoard)
            }, MOVING_TIMEOUT * 2)
        } else if (falledBricks > 0) {
            processboard(newBoard)
        } else {
            setCanClick(true)
        }
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
        <>
            <h2>{game.title}</h2>
            <Board canClick={canClick} board={game?.board} onMove={move} />
        </>
    )
}
