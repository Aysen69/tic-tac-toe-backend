
enum ServerToClient {
    AvailableRooms,
    WelcomeToRoom,
    YourTurn,
    TurnOfEnemy,
    YouLose,
    YouWin
}

enum ClientToServer {
    GetAvailableRooms,
    ConnectToRoom,
}

type ClientServerType = {
    id: number;
}

class Network {
}

export { Network }