import { Cell, CellContain, Winner, Vector2D } from './DuplexTypes'

export class RoomMap {
  private _cells: Cell[][]
  private _winLineLength: number
  private readonly _mapSize: number
  
  constructor(mapSize: number, markCount: number) {
    this._mapSize = mapSize
    this._winLineLength = markCount
    this._cells = []
    for (let y = 0, row: Cell[] = []; y < mapSize; y++) {
      row = []
      for (let x = 0; x < mapSize; x++) {
        row.push({
          coordinate: { x: x, y: y },
          cellContain: CellContain.Nothing,
          isChecked: false
        })
      }
      this._cells.push(row)
    }
  }

  public getMapSize(): number {
    return this._mapSize
  }

  public getMarkCount(): number {
    return this._winLineLength
  }
  
  public setCross(coordinate: Vector2D): boolean | void {
    if (this._cells[coordinate.y][coordinate.x].cellContain == CellContain.Nothing) {
      this._cells[coordinate.y][coordinate.x].cellContain = CellContain.Cross
      return true
    }
  }
  
  public setNought(coordinate: Vector2D): boolean | void {
    if (this._cells[coordinate.y][coordinate.x].cellContain == CellContain.Nothing) {
      this._cells[coordinate.y][coordinate.x].cellContain = CellContain.Nought
      return true
    }
  }
  
  public getCells(): Cell[][] {
    return this._cells
  }
  
  private _cellToWinner(cell: Cell): Winner | void {
    switch (cell.cellContain) {
      case CellContain.Cross:
        return Winner.TheCross;
      case CellContain.Nought:
        return Winner.TheNought;
    }
  }

  private _gameOver(cellLine: Cell[]): void {
    cellLine.forEach(cell => {
      this._cells[cell.coordinate.y][cell.coordinate.x].isChecked = true
    })
  }
  
  public checkGameOver(): Winner | void {
    // by horizontal
    for (let y = 0; y < this._mapSize; y++) {
      for (let x = 0, cellLine: Cell[] = []; x < this._mapSize; x++) {
        if (this._cells[y][x].cellContain != CellContain.Nothing) {
          if (cellLine.length == 0) {
            cellLine.push(this._cells[y][x])
          } else if (cellLine.length > 0) {
            if (cellLine[0].cellContain != this._cells[y][x].cellContain) {
              cellLine = []
            }
            cellLine.push(this._cells[y][x])
          }
          if (cellLine.length == this._winLineLength) {
            this._gameOver(cellLine)
            return this._cellToWinner(cellLine[0])
          }
        } else {
          cellLine = []
        }
      }
    }
    // by vertical
    for (let x = 0; x < this._mapSize; x++) {
      for (let y = 0, cellLine: Cell[] = []; y < this._mapSize; y++) {
        if (this._cells[y][x].cellContain != CellContain.Nothing) {
          if (cellLine.length == 0) {
            cellLine.push(this._cells[y][x])
          } else if (cellLine.length > 0) {
            if (cellLine[0].cellContain != this._cells[y][x].cellContain) {
              cellLine = []
            }
            cellLine.push(this._cells[y][x])
          }
          if (cellLine.length == this._winLineLength) {
            this._gameOver(cellLine)
            return this._cellToWinner(cellLine[0])
          }
        } else {
          cellLine = []
        }
      }
    }
    // by diag
    // *
    //   *
    for (let x = 0 - this._mapSize; x < this._mapSize * 2; x++) {
      for (let i = 0, cellLine: Cell[] = []; i < this._mapSize; i++) {
        let realX = i + x
        let realY = i
        if (realX >= 0 && realX < this._mapSize) {
          if (this._cells[realY][realX].cellContain != CellContain.Nothing) {
            if (cellLine.length == 0) {
              cellLine.push(this._cells[realY][realX])
            } else if (cellLine.length > 0) {
              if (cellLine[0].cellContain != this._cells[realY][realX].cellContain) {
                cellLine = []
              }
              cellLine.push(this._cells[realY][realX])
            }
            if (cellLine.length == this._winLineLength) {
              this._gameOver(cellLine)
              return this._cellToWinner(cellLine[0])
            }
          } else {
            cellLine = []
          }
        }
      }
    }
    //   *
    // *
    for (let x = 0 - this._mapSize; x < this._mapSize * 2; x++) {
      for (let i = 0, cellLine: Cell[] = []; i < this._mapSize; i++) {
        let realX = (0 - i) + x
        let realY = i
        if (realX >= 0 && realX < this._mapSize) {
          if (this._cells[realY][realX].cellContain != CellContain.Nothing) {
            if (cellLine.length == 0) {
              cellLine.push(this._cells[realY][realX])
            } else if (cellLine.length > 0) {
              if (cellLine[0].cellContain != this._cells[realY][realX].cellContain) {
                cellLine = []
              }
              cellLine.push(this._cells[realY][realX])
            }
            if (cellLine.length == this._winLineLength) {
              this._gameOver(cellLine)
              return this._cellToWinner(cellLine[0])
            }
          } else {
            cellLine = []
          }
        }
      }
    }
  }
}
