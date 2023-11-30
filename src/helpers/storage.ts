import { ILevelSolvedData, IPackSolvedData, IStats, TLevelID, TPackFile } from "../model/stats";
import { replacer, reviver } from "./json";

const KEY="com.kontranik.vexed.stats"

export function saveStats(packfile: TPackFile, levelid: TLevelID, levelStats: ILevelSolvedData) {

    let savedStats = loadStats()

    if (savedStats?.solvedLevels) {
        let packfileStats = savedStats.solvedLevels.get(packfile)
        if (packfileStats?.levels) {
            packfileStats.levels.set(levelid, levelStats)
        } else {
            packfileStats = {
                levels: new Map()
            }
            packfileStats.levels.set(levelid, levelStats)
        }
        savedStats.solvedLevels.set(packfile, packfileStats)
    } else {
        let packfileStats: IPackSolvedData = {
            levels: new Map()
        }
        packfileStats.levels.set(levelid, levelStats)

        savedStats = {
            solvedLevels: new Map()
        }
        savedStats.solvedLevels.set(packfile, packfileStats)
    }

    localStorage.setItem(KEY, JSON.stringify(savedStats, replacer))
}

export function loadStats(): IStats {
    let line = localStorage.getItem(KEY)
    let stats: IStats = line ? JSON.parse(line, reviver) : undefined
    return stats
}