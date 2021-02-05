import { Player } from './models/Player'
import { Room } from './models/Room'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import { SimpleRoom, RoomStatus } from './models/DuplexTypes'

const httpServer = createServer()
const io = new Server(httpServer, {})

let rooms: Room[] = []

io.on('connection', (socket: Socket) => {
  console.log('someone connected to server')
  const createRoom = (nickname: string, roomName: string, mapSize: number, markCount: number) => {
    console.log('creating room ' + roomName)
    let player = new Player(socket.id, nickname)
    let room = new Room(player, roomName, mapSize, markCount)
    rooms.push(room)
    io.to(player.id).emit('createdRoom', room.getAsSimpleRoom())
  }
  const getRooms = () => {
    console.log('getting rooms...')
    let simpleRooms: SimpleRoom[] = []
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].getRoomStatus() == RoomStatus.WaitingForPlayer) {
        let simpleRoom: SimpleRoom = rooms[i].getAsSimpleRoom()
        simpleRooms.push(simpleRoom)
      }
    }
    io.to(socket.id).emit('rooms', simpleRooms)
  }
  const joinToRoom = (nickname: string, roomId: string) => {
    console.log('joining to room id ' + roomId)
    let player = new Player(socket.id, nickname)
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].id == roomId) {
        rooms[i].joinPlayer(player)
        io.to(rooms[i].secondPlayer!.id).emit('youJoinedToTheRoom', {
          room: rooms[i].getAsSimpleRoom(),
          you: rooms[i].secondPlayer?.getAsSimplePlayer(),
          enemy: rooms[i].firstPlayer.getAsSimplePlayer()
        })
        io.to(rooms[i].firstPlayer.id).emit('someoneJoinedToYourRoom', {
          room: rooms[i].getAsSimpleRoom(),
          you: rooms[i].firstPlayer.getAsSimplePlayer(),
          enemy: rooms[i].secondPlayer?.getAsSimplePlayer()
        })
        break
      }
    }
  }
  const getTiles = (roomId: string) => {
    console.log('getting tiles...')
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].id == roomId) {
        io.to(rooms[i].firstPlayer.id).emit('tiles', rooms[i].getRoomMap().getCells())
        io.to(rooms[i].secondPlayer!.id).emit('tiles', rooms[i].getRoomMap().getCells())
        if (!rooms[i].isGameOver) {
          if (rooms[i].isTurnOfFirstPlayer) {
            io.to(rooms[i].firstPlayer.id).emit('turnOf', rooms[i].firstPlayer.id)
            io.to(rooms[i].secondPlayer!.id).emit('turnOf', rooms[i].firstPlayer.id)
          } else {
            io.to(rooms[i].firstPlayer.id).emit('turnOf', rooms[i].secondPlayer!.id)
            io.to(rooms[i].secondPlayer!.id).emit('turnOf', rooms[i].secondPlayer!.id)
          }
        }
        break
      }
    }
  }
  const _sendGameOverInfo = (roomId: string) => {
    console.log('sending game over info...')
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].id == roomId) {
        io.to(rooms[i].firstPlayer.id).emit('gameOver', {
          you: rooms[i].firstPlayer.getAsSimplePlayer(),
          enemy: rooms[i].secondPlayer?.getAsSimplePlayer()
        })
        io.to(rooms[i].secondPlayer!.id).emit('gameOver', {
          you: rooms[i].secondPlayer!.getAsSimplePlayer(),
          enemy: rooms[i].firstPlayer?.getAsSimplePlayer()
        })
      }
    }
  }
  const takeTurn = (playerId: string, roomId: string, x: number, y: number) => {
    console.log('taking turn of player id ' + playerId)
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].id == roomId) {
        rooms[i].takeTurn(playerId, { x: x, y: y })
        if (rooms[i].isGameOver) {
          _sendGameOverInfo(roomId)
        }
        getTiles(roomId)
        if (rooms[i].getRoomStatus() == RoomStatus.End) {
          rooms.splice(i, 1)
        }
        break
      }
    }
  }
  const surrender = (playerId: string, roomId: string) => {
    console.log('surrendering of player id ' + playerId)
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].id == roomId) {
        rooms[i].surrender(playerId)
        if (rooms[i].isGameOver) {
          _sendGameOverInfo(roomId)
        }
        if (rooms[i].getRoomStatus() == RoomStatus.End) {
          rooms.splice(i, 1)
        }
        break
      }
    }
  }
  const connectError = (err: Error) => {
    console.log(`connect_error due to ${err.message}`)
    for (let i = 0; i < rooms.length; i++) {
      if (
        rooms[i].firstPlayer.id == socket.id ||
        rooms[i].secondPlayer!.id == socket.id
      ) {
        rooms[i].connectionError()
        io.to(rooms[i].firstPlayer.id).emit('connectError')
        io.to(rooms[i].secondPlayer!.id).emit('connectError')
        _sendGameOverInfo(rooms[i].id)
        if (rooms[i].getRoomStatus() == RoomStatus.End) {
          rooms.splice(i, 1)
        }
        break
      }
    }
  }
  const disconnect = (reason: string) => {
    console.log(`disconnect due to ${reason}`)
    for (let i = 0; i < rooms.length; i++) {
      if (
        rooms[i].firstPlayer.id == socket.id ||
        rooms[i].secondPlayer!.id == socket.id
      ) {
        rooms[i].connectionError()
        io.to(rooms[i].firstPlayer.id).emit('roomDisconnect')
        io.to(rooms[i].secondPlayer!.id).emit('roomDisconnect')
        _sendGameOverInfo(rooms[i].id)
        if (rooms[i].getRoomStatus() == RoomStatus.End) {
          rooms.splice(i, 1)
        }
        break
      }
    }
  }
  socket.on('createRoom', createRoom)
  socket.on('getRooms', getRooms)
  socket.on('joinToRoom', joinToRoom)
  socket.on('getTiles', getTiles)
  socket.on('takeTurn', takeTurn)
  socket.on('surrender', surrender)
  socket.on('connect_error', connectError)
  socket.on('disconnect', disconnect)
})

httpServer.listen(3000)