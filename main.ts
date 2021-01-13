import { Player } from './models/Player'
import { Room, RoomStatus, SimpleRoom } from './models/Room'
import Vector2D from './models/Vector2D'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {})

let rooms: Room[] = []

io.on('connection', (socket: Socket) => {
  socket.on('createRoom', (nickname, roomName) => {
    let player = new Player(socket.id, nickname)
    let room = new Room(player, roomName)
    rooms.push(room)
    socket.emit('createdRoom', { roomId: room.id })
  })
  socket.on('getRooms', () => {
    let simpleRooms: SimpleRoom[] = []
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].getRoomStatus() == RoomStatus.WaitingForPlayer) {
        let simpleRoom: SimpleRoom = rooms[i].getAsSimpleRoom()
        simpleRooms.push(simpleRoom)
        break
      }
    }
    socket.emit('rooms', simpleRooms)
  })
  socket.on('joinToRoom', (nickname, roomId) => {
    let player = new Player(socket.id, nickname)
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].id == roomId) {
        rooms[i].joinPlayer(player)
        io.to(rooms[i].secondPlayer!.id).emit('joinedToRoom', {
          roomId: rooms[i].id,
          nickname: rooms[i].firstPlayer.nickname
        })
        io.to(rooms[i].firstPlayer.id).emit('someoneJoinedToYourRoom', {
          nickname: rooms[i].secondPlayer!.nickname
        })
        if (rooms[i].getRoomStatus() == RoomStatus.InBattle) {
          io.to(rooms[i].firstPlayer.id).emit('gameMap', rooms[i].getRoomMap().getCells())
          io.to(rooms[i].secondPlayer!.id).emit('gameMap', rooms[i].getRoomMap().getCells())
        }
        break
      }
    }
  })
  socket.on('takeTurn', (playerId, roomId, x, y) => {
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].id == roomId) {
        let turn = rooms[i].takeTurn(playerId, new Vector2D(x, y))
        io.to(rooms[i].firstPlayer.id).emit('gameMap', rooms[i].getRoomMap().getCells())
        io.to(rooms[i].secondPlayer!.id).emit('gameMap', rooms[i].getRoomMap().getCells())
        if (turn) {
          io.to(rooms[i].firstPlayer.id).emit('gameOver', turn, rooms[i].firstPlayer.gamerStatus)
          io.to(rooms[i].secondPlayer!.id).emit('gameOver', turn, rooms[i].secondPlayer!.gamerStatus)
        } else {
          io.to(rooms[i].firstPlayer.id).emit('isYourTurn', rooms[i].isTurnOfFirstPlayer)
          io.to(rooms[i].secondPlayer!.id).emit('isYourTurn', !rooms[i].isTurnOfFirstPlayer)
        }
        if (rooms[i].getRoomStatus() == RoomStatus.End) {
          io.to(rooms[i].firstPlayer.id).emit('yourRoomIsKilled')
          rooms.splice(i, 1)
        }
        break
      }
    }
  })
})

httpServer.listen(3000)