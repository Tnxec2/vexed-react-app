import { useEffect, useState } from 'react'
import './App.css'
import { CELL_TYPES, packs } from './const'
import { ILevel, TBoard } from './model/level'
import LevelList from './components/LevelList'
import { IPackFile } from './model/packfile'
import PackList from './components/PackList'
import Modal from './components/Modal'
import Game from './components/Game'

function App() {
    const [showPackList, setShowPackList] = useState(false)
    const [showLevelList, setShowLevelList] = useState(false)

    const [pack, setPack] = useState<IPackFile>(packs[0])
    const [levels, setLevels] = useState<ILevel[]>([])
    const [selectedLevel, setSelectedLevel] = useState<number>(0)
    const [game, setGame] = useState<ILevel>()

    useEffect(() => {
        setGame(levels[selectedLevel])
    }, [selectedLevel, levels])

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
                setLevels(newLevels)
            })
    }, [pack])

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

    return (
        <div className="App">
            <h1>Vexed!</h1>
            <h2>
                {pack.title}
                <button
                    type="button"
                    className="button selectPackButton"
                    onClick={() => setShowPackList(true)}
                >
                    Select Pack
                </button>
            </h2>
            <h3>
                {pack.desc}
                <button
                    type="button"
                    className="button selectPackButton"
                    onClick={() => setShowLevelList(true)}
                >
                    Select Level
                </button>
            </h3>

            {game && <Game initGame={game} />}

            <Modal
                title="Select Pack"
                children={
                    <PackList
                        selected={pack.file}
                        onChange={(idx) => {
                            setPack(packs[idx])
                            setShowPackList(false)
                        }}
                    />
                }
                show={showPackList}
                onClose={() => setShowPackList(false)}
            />
            <Modal
                title="Select Level"
                children={
                    <LevelList
                        selected={levels[selectedLevel]?.title}
                        levels={levels}
                        onChange={(ix) => {
                            setSelectedLevel(ix)
                            setShowLevelList(false)
                        }}
                    />
                }
                show={showLevelList}
                onClose={() => setShowLevelList(false)}
            />
        </div>
    )
}

export default App
