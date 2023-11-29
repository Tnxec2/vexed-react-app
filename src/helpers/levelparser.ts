import { useEffect, useState } from "react"
import { CELL_TYPES } from "../const"
import { ILevel, TBoard } from "../model/level"
import { IPackFile } from "../model/packfile"


export function useGetLevels(pack: IPackFile) {
    
    const [levels, setLevels] = useState<ILevel[]>([])

    useEffect(() => {
        const file = process.env.PUBLIC_URL + '/levels/' + pack.file

        fetch(file, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/text',
            },
        })
            .then((response) => response.text())
            .then((d) => {
                if (d.endsWith('\r\n')) return d.split('\r\n')
                else return d.split('\n')
            })
            .then((lines) => {
                setLevels(parseLevels(lines))
            })
    }, [pack])

    return levels
}

export function parseLevels(lines: string[]) {
    var title: string | undefined
    var board: TBoard
    var solution: string

    const newLevels: ILevel[] = []

    lines.forEach((line) => {
        console.log('line', line)
        if (line.includes('[Level]')) {
            if (title) {
                newLevels.push({
                    title: title,
                    board: board,
                    solution: solution,
                })
            }
            title = undefined
        } else if (line.includes('title'))
            title = line.split('=')[1]
        else if (line.includes('board')) board = parseBoard(line)
        else if (line.includes('solution'))
            solution = line.split('=')[1]
    })

    return newLevels
}

const parseBoard = (boardLine: string): TBoard => {
    let rows = boardLine.split('=')[1].split('/')
    let result: TBoard = []
    for (let rowNumber = 0; rowNumber < 8; rowNumber++) {
        let boardRow: string[] = []
        console.log(rowNumber, rows[rowNumber])

        if (rowNumber >= rows.length || rows[rowNumber] === '10')
            boardRow = getEmptyCels(10)
        else {
            let strRow = rows[rowNumber]
            let strCells = strRow.split('')
            strCells.forEach((ch) => {
                if (
                    ch in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
                ) {
                    boardRow = boardRow.concat(getEmptyCels(Number(ch)))
                } else {
                    boardRow.push(ch)
                }
            })
        }
        result.push(boardRow)
    }
    return result
}

function getEmptyCels(count: number) {
    let result = []
    for (let index = 0; index < count; index++) {
        result.push(CELL_TYPES.WALL)
    }
    return result
}