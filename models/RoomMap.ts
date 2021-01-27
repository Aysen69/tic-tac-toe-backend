import Vector2D from './Vector2D'

enum Cell {
  Cross,
  Nought,
  Nothing
}

enum Winner {
  Nobody,
  TheCross,
  TheNought,
  Draw
}

type WinDesc = {
  winner: Winner | void;
  line: Vector2D[]
}

class RoomMap {
  private _cells: Cell[][]
  private static _winLineLength = 3
  private readonly _mapSize: number
  
  constructor(mapSize: number) {
    this._mapSize = mapSize
    this._cells = []
    for (let y = 1, cellsX = []; y <= mapSize; y++) {
      cellsX = []
      for (let x = 1; x <= mapSize; x++) {
        cellsX.push(Cell.Nothing)
      }
      this._cells.push(cellsX)
    }
  }
  
  public setCross(coordinate: Vector2D): boolean | void {
    if (this._cells[coordinate.y][coordinate.x] == Cell.Nothing) {
      this._cells[coordinate.y][coordinate.x] = Cell.Cross
      return true
    }
  }
  
  public setNought(coordinate: Vector2D): boolean | void {
    if (this._cells[coordinate.y][coordinate.x] == Cell.Nothing) {
      this._cells[coordinate.y][coordinate.x] = Cell.Nought
      return true
    }
  }
  
  public getCells(): Cell[][] {
    return this._cells
  }
  
  private _cellToWinner(cell: Cell): Winner | void {
    switch (cell) {
      case Cell.Cross:
      return Winner.TheCross;
      case Cell.Nought:
      return Winner.TheNought;
    }
  }
  
  public checkWin(): WinDesc | void {
    // by horizontal
    for (let y = 0; y < this._mapSize; y++) {
      for (let x = 0, currentCell: Cell = this._cells[y][x], line: Vector2D[] = []; x < this._mapSize; x++) {
        if (currentCell == this._cells[y][x] && currentCell != Cell.Nothing) {
          line.push(new Vector2D(x, y))
          if (line.length == RoomMap._winLineLength) {
            return {
              winner: this._cellToWinner(currentCell),
              line: line
            }
          }
        } else {
          line = []
        }
        currentCell = this._cells[y][x]
      }
    }
    // by vertical
    for (let x = 0; x < this._mapSize; x++) {
      for (let y = 0, currentCell: Cell = this._cells[y][x], line: Vector2D[] = []; y < this._mapSize; y++) {
        if (currentCell == this._cells[y][x] && currentCell != Cell.Nothing) {
          line.push(new Vector2D(x, y))
          if (line.length == RoomMap._winLineLength) {
            return {
              winner: this._cellToWinner(currentCell),
              line: line
            }
          }
        } else {
          line = []
        }
        currentCell = this._cells[y][x]
      }
    }
    // by diag
    // *
    //   *
    for (let i = 0, currentCell: Cell = this._cells[i][i], line: Vector2D[] = []; i < this._mapSize; i++) {
      if (currentCell == this._cells[i][i] && currentCell != Cell.Nothing) {
        line.push(new Vector2D(i, i))
        if (line.length == RoomMap._winLineLength) {
          return {
            winner: this._cellToWinner(currentCell),
            line: line
          }
        }
      } else {
        line = [];
      }
      currentCell = this._cells[i][i]
    }
    //   *
    // *
    for (let y = 0, x = this._mapSize - 1, currentCell: Cell = this._cells[y][x], line: Vector2D[] = []; y < this._mapSize; y++, x--) {
      if (currentCell == this._cells[y][x] && currentCell != Cell.Nothing) {
        line.push(new Vector2D(y, x))
        if (line.length == RoomMap._winLineLength) {
          return {
            winner: this._cellToWinner(currentCell),
            line: line
          }
        }
      } else {
        line = [];
      }
      currentCell = this._cells[y][x]
    }
  }
}

export { RoomMap, Winner, WinDesc }