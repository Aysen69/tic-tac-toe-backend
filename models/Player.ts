import { GamerStatus, SimplePlayer } from "./DuplexTypes"

export class Player {
  public readonly id: string
  public readonly nickname: string
  private _gamerStatus: GamerStatus
  
  constructor(id: string, nickname: string) {
    this.id = id
    this.nickname = nickname
    this._gamerStatus = GamerStatus.Waiting
  }
  
  public get gamerStatus(): GamerStatus {
    return this._gamerStatus
  }
  
  public set gamerStatus(gamerStatus: GamerStatus) {
    this._gamerStatus = gamerStatus
  }

  public getAsSimplePlayer(): SimplePlayer {
    return {
      id: this.id,
      nickname: this.nickname,
      gamerStatus: this._gamerStatus
    }
  }
}
