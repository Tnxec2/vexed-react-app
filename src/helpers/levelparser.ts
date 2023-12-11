import { useEffect, useState } from "react"
import { CELL_TYPES } from "../const"
import { ILevel, TBoard } from "../model/level"
import { IPackFile } from "../model/packfile"
import { TPackFile } from "../model/stats"
import { loadStats } from "./storage"


export function useGetLevels(pack: IPackFile) {
    
    const [levels, setLevels] = useState<ILevel[]>([])

    useEffect(() => {
        const file = 'levels/' + pack.file

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
                setLevels(loadStatsInLevels(pack.file, parseLevels(lines)))
            })
    }, [pack])

    return { levels, setLevels }
}

function loadStatsInLevels(packfile: TPackFile, levels: ILevel[]): ILevel[] {
    const savedStats = loadStats()
    
    const levelStats = savedStats?.solvedLevels.get(packfile)
    let result: ILevel[]
    if (levelStats?.levels) {        
        result = levels.map((level) => {
            return levelStats.levels.has(level.id) ? {...level, solved: levelStats.levels.get(level.id)} : level
        })
    } else {
        result = levels
    }
    return result
}

export function parseLevels(lines: string[]) {
    var id: number = 0
    var title: string | undefined
    var board: TBoard
    var solution: string

    const newLevels: ILevel[] = []

    lines.forEach((line) => {
        if (line.includes('[Level]')) {
            if (title) {
                newLevels.push({
                    id: id,
                    title: title,
                    board: board,
                    solution: solution,
                })
                
                id++
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