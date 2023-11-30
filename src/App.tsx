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
import { formatTime } from './helpers/time'
import { saveStats } from './helpers/storage'
import { ILevelSolvedData } from './model/stats'
import AlertBox, { ALERT_TYPE } from './components/AlertBox'

function App() {
    const [showPackList, setShowPackList] = useState(false)
    const [showLevelList, setShowLevelList] = useState(false)
    const [gameWon, setGameWon] = useState(false)
    const [gameOver, setGameOver] = useState(false)

    const [pack, setPack] = useState<IPackFile>(packs[0])
    const { levels, setLevels } = useGetLevels(pack)
    const [selectedLevel, setSelectedLevel] = useState<number>(0)
    const [game, setGame] = useState<ILevel>()

    useEffect(() => {
        setGame(levels[selectedLevel])
    }, [selectedLevel, levels])

    useEffect(() => {
        setSelectedLevel(0)
    }, [pack])

    const win = (turnCount: number, time: number) => {
        setGameWon(true)
        console.log(turnCount, time)
        const solved: ILevelSolvedData = {
            turn: turnCount,
            time: time,
            date: new Date(),
        }
        setLevels(
            levels.map((level, ix) =>
                ix === selectedLevel ? { ...level, solved: solved } : level
            )
        )
        saveStats(pack.file, selectedLevel, solved)
    }

    return (
        <div className="App">
            <div className="content">
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
                        onWin={win}
                        onFail={() => setGameOver(true)}
                    />
                )}
            </div>
            <div className="footer">
                <div className="footertext">
                    Assets and levels are from original{' '}
                    <a href="https://vexed.sourceforge.net/index.html">Vexed</a>{' '}
                    game.
                </div>
            </div>

            <Modal
                show={gameWon}
                onClose={() => {
                    setGameWon(false)
                }}
            >
                <h1>😄 You won the Game! 🎉</h1>
                {levels[selectedLevel] && (
                    <div>
                        <p>
                            Time:{' '}
                            {formatTime(levels[selectedLevel].solved?.time)}
                        </p>
                        <p>Turns: {levels[selectedLevel].solved?.turn}</p>
                        {selectedLevel === levels.length - 1 && (
                            <AlertBox
                                message="Last level reached. Select level from the list or choose other level pack"
                                type={ALERT_TYPE.NOTICE}
                            />
                        )}
                        <div>
                            <button
                                className="button me-3"
                                onClick={() => {
                                    setGameWon(false)
                                }}
                            >
                                Close
                            </button>
                            {selectedLevel < levels.length - 1 && (
                                <button
                                    className="button"
                                    onClick={() => {
                                        if (selectedLevel < levels.length - 1) {
                                            setSelectedLevel(selectedLevel + 1)
                                            setGameWon(false)
                                        } else {
                                            alert(
                                                'Last level reached. Select level from the list or choose other level pack'
                                            )
                                        }
                                    }}
                                >
                                    Next Level
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
            <Modal
                show={gameOver}
                onClose={() => {
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
                        setShowLevelList(false)
                        setSelectedLevel(ix)
                    }}
                />
            </Modal>
        </div>
    )
}

export default App
