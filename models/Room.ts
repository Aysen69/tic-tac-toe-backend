import { Player, GamerStatus } from './Player'
import Vector2D from './Vector2D'
import { RoomMap, Winner } from './RoomMap'
import { v4 as uuidv4 } from 'uuid'

enum RoomStatus {
    WaitingForPlayer,
    InBattle,
    End
}

type SimpleRoom = {
  id: string
  name: string
}

class Room {
    public readonly id: string
    public readonly name: string
    public firstPlayer: Player
    public secondPlayer?: Player
    private _roomMap: RoomMap
    public isTurnOfFirstPlayer: boolean
    private _roomStatus: RoomStatus

    constructor(player: Player, name: string, mapSize?: number, timeoutInSeconds?: number) {
        mapSize = mapSize ? mapSize : 3
        timeoutInSeconds = timeoutInSeconds ? timeoutInSeconds : 60 * 15
        this.id = uuidv4()
        this.name = name
        this.firstPlayer = player
        this.firstPlayer.gamerStatus = GamerStatus.Waiting
        this._roomMap = new RoomMap(mapSize)
        this.isTurnOfFirstPlayer = true
        this._roomStatus = RoomStatus.WaitingForPlayer
        setTimeout(() => this._roomStatus = RoomStatus.End, timeoutInSeconds)
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

    public takeTurn(playerId: string, coordinate: Vector2D): Vector2D[] | void {
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
                let win = this._roomMap!.checkWin()
                if (win) {
                    if (win.winner == Winner.TheCross) {
                        this._gameOver(this.firstPlayer)
                    } else if (win.winner == Winner.TheNought) {
                        this._gameOver(this.secondPlayer)
                    } else {
                        this._gameOver()
                    }
                    return win.line
                }
            }
        }
    }

    public surrender(playerId: string): void {
        if (this._roomStatus == RoomStatus.InBattle) {
            let isSurrendered = false
            if (playerId == this.firstPlayer.id) {
                this._gameOver(this.secondPlayer)
                isSurrendered = true
            }
            if (playerId == this.secondPlayer!.id) {
                this._gameOver(this.firstPlayer)
                isSurrendered = true
            }
            if (isSurrendered) {
                this._roomStatus = RoomStatus.End
            }
        }
    }

    private _gameOver(winner?: Player) {
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
                this.firstPlayer.gamerStatus = GamerStatus.Draw
                this.secondPlayer!.gamerStatus = GamerStatus.Draw
            }
        }
    }

    public getAsSimpleRoom(): SimpleRoom {
        return {
            id: this.id,
            name: this.name
        }
    }
}

export { Room, RoomStatus, SimpleRoom }