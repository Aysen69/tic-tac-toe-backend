import { Player } from './models/Player'
import { Room, RoomStatus, SimpleRoom } from './models/Room'
import Vector2D from './models/Vector2D'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {})

let rooms: Room[] = []

io.on('connection', (socket: Socket) => {
  console.log('someone connected to server')
  socket.on('createRoom', (nickname: string, roomName: string) => {
    console.log('creating room ' + roomName)
    let player = new Player(socket.id, nickname)
    let room = new Room(player, roomName)
    rooms.push(room)
    io.to(player.id).emit('createdRoom', room.getAsSimpleRoom())
  })
  socket.on('getRooms', () => {
    console.log('getting rooms...')
    let simpleRooms: SimpleRoom[] = []
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].getRoomStatus() == RoomStatus.WaitingForPlayer) {
        let simpleRoom: SimpleRoom = rooms[i].getAsSimpleRoom()
        simpleRooms.push(simpleRoom)
      }
    }
    io.to(socket.id).emit('rooms', simpleRooms)
  })
  socket.on('joinToRoom', (nickname: string, roomId: string) => {
    console.log('joining to room id ' + roomId)
    let player = new Player(socket.id, nickname)
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].id == roomId) {
        rooms[i].joinPlayer(player)
        io.to(rooms[i].secondPlayer!.id).emit('youJoinedToTheRoom', {
          yourEnemy: { nickname: rooms[i].firstPlayer.nickname }
        })
        io.to(rooms[i].firstPlayer.id).emit('someoneJoinedToYourRoom', {
          yourEnemy: { nickname: rooms[i].secondPlayer!.nickname }
        })
        if (rooms[i].getRoomStatus() == RoomStatus.InBattle) {
          io.to(rooms[i].firstPlayer.id).emit('tiles', rooms[i].getRoomMap().getCells())
          io.to(rooms[i].secondPlayer!.id).emit('tiles', rooms[i].getRoomMap().getCells())
        }
        break
      }
    }
  })
  socket.on('takeTurn', (playerId: string, roomId: string, x: number, y: number) => {
    console.log('taking turn of player id ' + playerId)
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].id == roomId) {
        let turn = rooms[i].takeTurn(playerId, new Vector2D(x, y))
        io.to(rooms[i].firstPlayer.id).emit('tiles', rooms[i].getRoomMap().getCells())
        io.to(rooms[i].secondPlayer!.id).emit('tiles', rooms[i].getRoomMap().getCells())
        if (turn) {
          io.to(rooms[i].firstPlayer.id).emit('gameOver', rooms[i].firstPlayer.gamerStatus, turn)
          io.to(rooms[i].secondPlayer!.id).emit('gameOver', rooms[i].secondPlayer!.gamerStatus, turn)
        } else {
          if (rooms[i].isTurnOfFirstPlayer) {
            io.to(rooms[i].firstPlayer.id).emit('yourTurn')
            io.to(rooms[i].secondPlayer!.id).emit('enemyTurn')
          } else {
            io.to(rooms[i].firstPlayer.id).emit('enemyTurn')
            io.to(rooms[i].secondPlayer!.id).emit('yourTurn')
          }
        }
        if (rooms[i].getRoomStatus() == RoomStatus.End) {
          rooms.splice(i, 1)
        }
        break
      }
    }
  })
  socket.on('surrender', (playerId: string, roomId: string) => {
    console.log('surrendering of player id ' + playerId)
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].id == roomId) {
        rooms[i].surrender(playerId)
        if (rooms[i].getRoomStatus() == RoomStatus.End) {
          io.to(rooms[i].firstPlayer.id).emit('gameOver', rooms[i].firstPlayer.gamerStatus, null)
          io.to(rooms[i].secondPlayer!.id).emit('gameOver', rooms[i].secondPlayer!.gamerStatus, null)
          rooms.splice(i, 1)
        }
        break
      }
    }
  })
})

httpServer.listen(3000)