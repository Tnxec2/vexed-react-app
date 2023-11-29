import { useEffect, useState } from 'react'
import './App.css'
import { packs } from './const'
import { ILevel } from './model/level'
import LevelList from './components/LevelList'
import { IPackFile } from './model/packfile'
import PackList from './components/PackList'
import Modal from './components/Modal'
import Game from './components/Game'
import { useGetLevels } from './helpers/levelparser'

function App() {
    const [showPackList, setShowPackList] = useState(false)
    const [showLevelList, setShowLevelList] = useState(false)
    const [gameWon, setGameWon] = useState(false)
    const [gameOver, setGameOver] = useState(false)

    const [pack, setPack] = useState<IPackFile>(packs[0])
    const levels = useGetLevels(pack)
    const [selectedLevel, setSelectedLevel] = useState<number>(0)
    const [game, setGame] = useState<ILevel>()

    useEffect(() => {
        setGame(levels[selectedLevel])
    }, [selectedLevel, levels])

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

            {game && (
                <Game
                    initGame={game}
                    onWin={() => setGameWon(true)}
                    onFail={() => setGameOver(true)}
                />
            )}

            <Modal
                show={gameWon}
                onClose={() => {
                    console.log('TODO: start new game')
                    setGameWon(false)
                }}
            >
                <p>😄 You won the Game!</p>
            </Modal>
            <Modal
                show={gameOver}
                onClose={() => {
                    console.log('TODO: start new game')
                    setGameOver(false)
                }}
            >
                <h2>😢 You fail. You can not yet win the Game!</h2>
            </Modal>
            <Modal
                title="Select Pack"
                show={showPackList}
                onClose={() => setShowPackList(false)}
            >
                <PackList
                    selected={pack.file}
                    onChange={(idx) => {
                        setPack(packs[idx])
                        setShowPackList(false)
                    }}
                />
            </Modal>
            <Modal
                title="Select Level"
                show={showLevelList}
                onClose={() => setShowLevelList(false)}
            >
                <LevelList
                    selected={levels[selectedLevel]?.title}
                    levels={levels}
                    onChange={(ix) => {
                        setSelectedLevel(ix)
                        setShowLevelList(false)
                    }}
                />
            </Modal>
        </div>
    )
}

export default App
