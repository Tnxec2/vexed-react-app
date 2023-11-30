import { ILevelSolvedData } from "./stats"

export type TBoard = string[][]

export interface ILevel {
    id: number
    title: string
    board: TBoard
    solution: string
    solved?: ILevelSolvedData
}
