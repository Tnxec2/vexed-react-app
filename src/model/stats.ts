export type TLevelID = number
export type TPackFile = string

export interface ILevelSolvedData {
    turn: number
    time: number,
    date: Date
}

export interface IPackSolvedData {
    levels: Map<TLevelID, ILevelSolvedData>
}

export interface IStats {
    solvedLevels: Map<TPackFile, IPackSolvedData>
}