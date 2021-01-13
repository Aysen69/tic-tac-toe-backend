enum GamerStatus {
    Win,
    Lose,
    Draw,
    InBattle,
    Waiting
}

class Player {
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
}

export { Player, GamerStatus }