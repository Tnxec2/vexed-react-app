import { ICoords } from "./coords"



export enum MoveTypes {
    LEFT,
    RIGHT,
    DOWN,
    ERASE
}

export interface IMove {
    from: ICoords
    to: ICoords
    typeMove: MoveTypes
    typeTile: string
}