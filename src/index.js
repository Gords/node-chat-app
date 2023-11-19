const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = 3000
const publicDirectoryPath  = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket)=>{
    console.log('New WebSocket connection')



    socket.on('join', ({username, room})=>{
        socket.join(room)

        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`))
    })
    
    socket.on('sendMessage', (message, callback)=>{
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        io.to('Asuncion').emit('message', generateMessage(message))
        callback()
    })

    socket.on('disconnect', ()=>{
        io.emit('message', generateMessage('A user has left!'))
    })

    socket.on('sendLocation', (coords, callback)=>{
        if (!coords){
            return callback('Location not found!')
        }
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

})

server.listen(port, () => console.log(`Example app listening on port ${port}!`))

module.exports = app