import { Player, GamerStatus } from './Player'
import Vector2D from './Vector2D'
import { RoomMap, Winner } from './RoomMap'
import { v4 as uuidv4 } from 'uuid'

enum RoomStatus {
    WaitingForPlayer,
    InBattle,
    End
}

type Players = {
    first: Player;
    second: Player | void;
}

class Room {
    public readonly id: string
    public readonly name: string
    private _firstPlayer: Player
    private _secondPlayer?: Player
    private _roomMap: RoomMap
    private _isTurnOfFirstPlayer: boolean
    private _roomStatus: RoomStatus

    constructor(player: Player, name: string, mapSize: number) {
        this.id = uuidv4()
        this.name = name
        this._firstPlayer = player
        this._firstPlayer.gamerStatus = GamerStatus.Waiting
        this._roomMap = new RoomMap(mapSize)
        this._isTurnOfFirstPlayer = true
        this._roomStatus = RoomStatus.WaitingForPlayer
    }

    public getPlayers(): Players {
        return {
            first: this._firstPlayer,
            second: this._secondPlayer
        }
    }

    public getRoomStatus(): RoomStatus {
        return this._roomStatus
    }

    public getRoomMap(): RoomMap {
        return this._roomMap
    }

    public joinPlayer(player: Player) {
        if (this._roomStatus == RoomStatus.WaitingForPlayer) {
            this._roomStatus = RoomStatus.InBattle
            this._secondPlayer = player
            this._secondPlayer.gamerStatus = GamerStatus.InBattle
            this._firstPlayer.gamerStatus = GamerStatus.InBattle
        }
    }

    public takeTurn(player: Player, coordinate: Vector2D) {
        if (this._roomStatus == RoomStatus.InBattle) {
            let isTurnTaked = false;
            if (this._isTurnOfFirstPlayer == true && this._firstPlayer.id == player.id) {
                if (this._roomMap!.setCross(coordinate)) isTurnTaked = true
            }
            if (this._isTurnOfFirstPlayer == false && this._secondPlayer!.id == player.id) {
                if (this._roomMap!.setNought(coordinate)) isTurnTaked = true
            }
            if (isTurnTaked) {
                this._isTurnOfFirstPlayer = !this._isTurnOfFirstPlayer
                let win = this._roomMap!.checkWin()
                if (win) {
                    if (win.winner == Winner.TheCross) {
                        this._gameOver(this._firstPlayer)
                    } else if (win.winner == Winner.TheNought) {
                        this._gameOver(this._secondPlayer)
                    } else {
                        this._gameOver()
                    }
                    return win.line
                }
            }
        }
    }

    public surrender(player: Player) {
        if (this._roomStatus == RoomStatus.InBattle) {
            let isSurrendered = false
            if (player.id == this._firstPlayer.id) {
                this._gameOver(this._secondPlayer)
                isSurrendered = true
            }
            if (player.id == this._secondPlayer!.id) {
                this._gameOver(this._firstPlayer)
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
                if (winner.id == this._firstPlayer.id) {
                    this._firstPlayer.gamerStatus = GamerStatus.Win
                    this._secondPlayer!.gamerStatus! = GamerStatus.Lose
                } else if (winner.id == this._secondPlayer!.id) {
                    this._firstPlayer.gamerStatus = GamerStatus.Lose
                    this._secondPlayer!.gamerStatus = GamerStatus.Win
                }
            } else {
                this._firstPlayer.gamerStatus = GamerStatus.Draw
                this._secondPlayer!.gamerStatus = GamerStatus.Draw
            }
        }
    }
}

export { Room, RoomStatus }