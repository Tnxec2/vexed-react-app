import { useState } from 'react'
import styles from './Board.module.css'
import { ICoords } from '../model/coords'
import { CELL_TYPES } from '../const'
import { TBoard } from '../model/level'

export default function Board(props: {
    canClick: boolean
    board: TBoard
    onMove: (from: ICoords, to: ICoords) => void
    onClick: (itemCoords: ICoords) => void
}) {
    const [clickedItem, setClickedItem] = useState<ICoords | null>()

    const moveTo = (coords: ICoords) => {
        if (props.canClick && clickedItem && canClicked(coords)) {
            setClickedItem(null)
            props.onMove(clickedItem, coords)
        }
    }

    const isClicked = (coords: ICoords): boolean => {
        return clickedItem
            ? coords.row === clickedItem?.row && coords.col === clickedItem.col
            : false
    }

    const canClicked = (coords: ICoords): boolean => {
        if (props.canClick && clickedItem) {
            if (clickedItem.row === coords.row) {
                if (
                    coords.col === clickedItem.col - 1 ||
                    coords.col === clickedItem.col + 1
                )
                    return true
            }
        }
        return false
    }

    const getCell = (cellStr: string, coords: ICoords) => {
        switch (cellStr) {
            case CELL_TYPES.WALL:
                return (
                    <div key={coords.row + '' + coords.col} className={`${styles.wall} ${styles.cell}`}>
                        <img src={'assets/wall.bmp'} alt={cellStr} />
                    </div>
                )
            case CELL_TYPES.AIR:
                return (
                    <div key={coords.row + '' + coords.col}
                        className={`${styles.empty} ${styles.cell} ${
                            canClicked(coords) ? styles.clickable : ''
                        }`}
                        onClick={() => moveTo(coords)}
                    ></div>
                )
            default:
                return (
                    <div key={coords.row + '' + coords.col}
                        className={`${styles.cell} ${
                            props.canClick ? styles.clickable : ''
                        } ${isClicked(coords) ? styles.clicked : ''}`}
                        onClick={() => {
                            if (props.canClick) {
                                setClickedItem(coords)
                                props.onClick(coords)
                            }
                        }}
                    >
                        <img
                            src={
                                'assets/block' +
                                (cellStr.charCodeAt(0) -
                                    'a'.charCodeAt(0) +
                                    1) +
                                '.bmp'
                            }
                            alt={cellStr}
                        />
                    </div>
                )
        }
    }
    return (
        <div className={styles.table}>
            {props.board.map((row, rowi) => (
                <div key={rowi} className={styles.row}>
                    {row.map((cell, celli) =>
                        getCell(cell, { col: celli, row: rowi })
                    )}
                </div>
            ))}
        </div>
    )
}
