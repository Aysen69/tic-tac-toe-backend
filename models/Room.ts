import { Player } from './Player'
import { RoomMap } from './RoomMap'
import { v4 as uuidv4 } from 'uuid'
import { GamerStatus, SimpleRoom, RoomStatus, Winner, Vector2D } from './DuplexTypes'

export class Room {
  public readonly id: string
  public readonly name: string
  public firstPlayer: Player
  public secondPlayer?: Player
  private _roomMap: RoomMap
  public isTurnOfFirstPlayer: boolean
  public isGameOver: boolean
  private _roomStatus: RoomStatus
  
  constructor(player: Player, name: string, mapSize?: number, markCount?: number, timeoutInSeconds?: number) {
    mapSize = mapSize ? mapSize : 9
    markCount = markCount ? markCount : 3
    timeoutInSeconds = timeoutInSeconds ? timeoutInSeconds : 60 * 15
    this.id = uuidv4()
    this.name = name
    this.firstPlayer = player
    this.firstPlayer.gamerStatus = GamerStatus.Waiting
    this._roomMap = new RoomMap(mapSize, markCount)
    this.isTurnOfFirstPlayer = true
    this.isGameOver = false
    this._roomStatus = RoomStatus.WaitingForPlayer
    setTimeout(() => {
      this._roomStatus = RoomStatus.End
    }, 1000 * timeoutInSeconds)
  }
  
  public getRoomStatus(): RoomStatus {
    return this._roomStatus
  }
  
  public getRoomMap(): RoomMap {
    return this._roomMap
  }
  
  public joinPlayer(player: Player) {
    if (this._roomStatus == RoomStatus.WaitingForPlayer) {
      this.secondPlayer = player
      this._roomStatus = RoomStatus.InBattle
      this.secondPlayer.gamerStatus = GamerStatus.InBattle
      this.firstPlayer.gamerStatus = GamerStatus.InBattle
    }
  }
  
  public takeTurn(playerId: string, coordinate: Vector2D): void {
    if (this._roomStatus == RoomStatus.InBattle) {
      let isTurnTaked = false
      if (this.isTurnOfFirstPlayer == true && this.firstPlayer.id == playerId) {
        if (this._roomMap!.setCross(coordinate)) isTurnTaked = true
      }
      if (this.isTurnOfFirstPlayer == false && this.secondPlayer!.id == playerId) {
        if (this._roomMap!.setNought(coordinate)) isTurnTaked = true
      }
      if (isTurnTaked) {
        this.isTurnOfFirstPlayer = !this.isTurnOfFirstPlayer
        let winner = this._roomMap!.checkGameOver()
        if (winner) {
          if (winner == Winner.TheCross) {
            this._gameOver(false, this.firstPlayer)
          } else if (winner == Winner.TheNought) {
            this._gameOver(false, this.secondPlayer)
          } else {
            this._gameOver(false)
          }
        }
      }
    }
  }
  
  public surrender(playerId: string): void {
    if (this._roomStatus == RoomStatus.InBattle) {
      let isSurrendered = false
      if (playerId == this.firstPlayer.id) {
        this._gameOver(false, this.secondPlayer)
        isSurrendered = true
      }
      if (playerId == this.secondPlayer!.id) {
        this._gameOver(false, this.firstPlayer)
        isSurrendered = true
      }
      if (isSurrendered) {
        this._roomStatus = RoomStatus.End
      }
    }
  }
  
  public connectionError(): void {
    this._gameOver(true)
  }
  
  private _gameOver(hasError: boolean, winner?: Player) {
    console.log('game over room id ' + this.id)
    this.isGameOver = true
    if (this._roomStatus == RoomStatus.InBattle) {
      this._roomStatus = RoomStatus.End
      if (winner) {
        if (winner.id == this.firstPlayer.id) {
          this.firstPlayer.gamerStatus = GamerStatus.Win
          this.secondPlayer!.gamerStatus = GamerStatus.Lose
        } else if (winner.id == this.secondPlayer!.id) {
          this.firstPlayer.gamerStatus = GamerStatus.Lose
          this.secondPlayer!.gamerStatus = GamerStatus.Win
        }
      } else {
        if (hasError) {
          this.firstPlayer.gamerStatus = GamerStatus.Error
          this.secondPlayer!.gamerStatus = GamerStatus.Error
        } else {
          this.firstPlayer.gamerStatus = GamerStatus.Draw
          this.secondPlayer!.gamerStatus = GamerStatus.Draw
        }
      }
    }
  }
  
  public getAsSimpleRoom(): SimpleRoom {
    return {
      id: this.id,
      name: this.name,
      mapSize: this._roomMap.getMapSize(),
      markCount: this._roomMap.getMarkCount()
    }
  }
}
