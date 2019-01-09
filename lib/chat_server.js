var socketio = require('socket.io');
var io;
var guestNumber = 1;
var niceNames = {};
var namesUsed = {};
var currentRoom = {};

exports.listen = function(server){
    io = socketio.listen(server);
    io.set('log level',1);
    io.sockets.on('connection', function(socket){
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
        joinRoom(socket, 'lobby');

        handleMessageBroadcasting(socket, nickNames);
        handleNameChangeAttempts(socket, niceNames, namesUsed);
        handleRoomJoining(socket);
        socket.on('rooms', function(){
            socket.emit('rooms', io.sockets.manager.rooms);
        });

        handleClientDisconnection(socket, niceNames, namesUsed);
    })
}

// 分配用户昵称
function assignGuestName(socket, guestNumber, nickNames, namesUsed){
    var name = 'Guest' + guestNumber;
    nickNames[socket.id] = name;
    socket.emit('nameResult', {
        success: true,
        name: name
    });
    namesUsed.push(name);
    return guestNumber + 1;
}

function joinRoom(socket, room){
    socket.join(room);
    currentRoom[socket.id] = room;
    socket.emit('joinResult', {room: room});

    socket.broadcast.to(room).emit('message', {
        text: nickNames[socket.id] + 'has joined' + room + '.'
    });

    var usersInRoom = io.socket.clients(room);
    if(usersInRoom.length > 1){
        var usersInRoomSummary = 'User currently in' + room + ':';
        for(var index in usersInRoom){
            var userSocketId = usersInRoom[index].id;
            if(userSocketId != socket.id){
                if(index > 0){
                    usersInRoomSummary = ',';
                }
                usersInRoomSummary += niceNames[userSocketId];
            }
        }
        usersInRoomSummary += '.';
        socket.emit('message', {text: usersInRoomSummary});
    }
}