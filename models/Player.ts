enum GamerStatus {
    Win,
    Lose,
    Draw,
    InBattle,
    Waiting
}

class Player {
    public readonly id: number
    private _gamerStatus: GamerStatus

    constructor(id: number) {
        this.id = id
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