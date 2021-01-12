import { Player } from './models/Player'
import { Room, RoomStatus } from './models/Room'
import Vector2D from './models/Vector2D'
import * as net from 'net'

let player = new Player(412)
let player2 = new Player(413)
let room = new Room(player, 'haha', 3)
room.joinPlayer(player2)
room.takeTurn(player, new Vector2D(0, 0))
room.takeTurn(player2, new Vector2D(1, 0))
room.takeTurn(player, new Vector2D(0, 1))
room.takeTurn(player2, new Vector2D(1, 1))
let turn = room.takeTurn(player, new Vector2D(0, 2))
room.getRoomStatus()
room.getPlayers()

// let server: net.Server = net.createServer((s: net.Socket) => {
//     s.setDefaultEncoding('utf-8')
//     s.on('end', () => {
//         console.log('client disconnected')
//     })
//     s.on('data', (chunk: Buffer) => {
//         console.log('chunk', chunk, s.address())
//     })
//     console.log('client connected', s.address())
//     s.write('hello')
//     s.pipe(s)
// })
// server.on('error', (err) => {
//     console.error(JSON.stringify(err))
//     // throw err
// })
// server.listen(8124, () => {
//     console.log('server bound')
// })