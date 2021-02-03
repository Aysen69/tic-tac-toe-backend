export enum GamerStatus {
  Win,
  Lose,
  Draw,
  InBattle,
  Waiting
}

export type SimplePlayer = {
  id: string
  nickname: string
  gamerStatus: GamerStatus
}

export type SimpleRoom = {
  id: string
  name: string
  mapSize: number
  markCount: number
}

export enum RoomStatus {
  WaitingForPlayer,
  InBattle,
  End
}

export enum CellContain {
  Cross,
  Nought,
  Nothing
}

export enum Winner {
  Nobody,
  TheCross,
  TheNought,
  Draw
}

export type GameOver = {
  winner: Winner | void;
  line: Vector2D[]
}

export type Cell = {
  coordinate: Vector2D
  cellContain: CellContain
  isChecked: boolean
}

export enum BgColor {
  Win,
  Lose,
  Nothing
}

export type CellType = {
  cellContain: CellContain,
  isSelected: boolean,
  bgColor: BgColor
}

export type Vector2D = {
  x: number
  y: number
}
