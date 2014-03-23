var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
  var name = 'Guest' + guestNumber; // Generate new guest name
  // Associate guest name with client connection ID
  nickNames[socket.id] = name;

  // Let user know, their guest name
  socket.emit('nameResult', {
    success: true,
    name: name
  }); // socket

  // Note that guest name is now used
  namesUsed.push(name);

  // Increment counter used to generate guest names
  return guestNumber + 1;
} // assignGuestName

function joinRoom(socket, room) {
  socket.join(room); // Make user join room
  currentRoom[socket.id] = room; // Note that user is now in this room
  socket.emit('joinResult', {room: room}); // Let user know they’re now in new room
  // Let other users in room know that user has joined
  socket.broadcast.to(room).emit('message', {
    text: nickNames[socket.id] + ' has joined ' + room + '.'
  }); // socket


  // Determine what other users are in same room as user
  var usersInRoom = io.sockets.clients(room);
  if (usersInRoom.length > 1) { // If other users exist, summarize who they are

    var usersInRoomSummary = 'Users currently in ' + room + ': ';
    var userSocketId;
    var index;
    for (index in usersInRoom) {
      userSocketId = usersInRoom[index].id;
      if (userSocketId !== socket.id) {
        if (index > 0) {
          usersInRoomSummary += ', ';
        }
        usersInRoomSummary += nickNames[userSocketId];
      }
    } // for
    usersInRoomSummary += '.';
    socket.emit('message', {text: usersInRoomSummary}); // Send summary of 
                                    // other users in the room to the user
  } // if
} // joinRoom

function handleNameChangeAttempts(socket, nickNames, namesUsed) {
  // Add listener for nameAttempt events
  socket.on('nameAttempt', function (name) {
    // Don’t allow nicknames to begin with Guest
    if (name.indexOf('Guest') === 0) {
      socket.emit('nameResult', {
        success: false,
        message: 'Names cannot begin with "Guest".'
      });
    } else {
      // If name isn’t already registered, register it 
      if (namesUsed.indexOf(name) === -1) {
        var previousName = nickNames[socket.id];
        var previousNameIndex = namesUsed.indexOf(previousName);
        namesUsed.push(name);
        nickNames[socket.id] = name;
        // Remove previous name to make available to other clients
        delete namesUsed[previousNameIndex];
        socket.emit('nameResult', {
          success: true,
          name: name
        });
        socket.broadcast.to(currentRoom[socket.id]).emit('message', {
          text: previousName + ' is now known as ' + name + '.'
        });
      } else {
        // Send error to client if name is already registered
        socket.emit('nameResult', {
          success: false,
          message: 'That name is already in use.'
        });
      } // else
    } // else
  });
} // handleNameChangeAttempts

function handleMessageBroadcasting(socket) {
  socket.on('message', function (message) {
    socket.broadcast.to(message.room).emit('message', {
      text: nickNames[socket.id] + ': ' + message.text
    });
  });
} // handleMessageBroadcasting

function handleRoomJoining(socket) {
  socket.on('join', function (room) {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom);
  });
} // handleRoomJoining

function handleClientDisconnection(socket) {
  socket.on('disconnect', function () {
    var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  });
} // handleClientDisconnection


exports.listen = function (server) {
  // Start Socket.IO server, allowing it
  // to piggyback on existing HTTP server
  io = socketio.listen(server);
  io.set('log level', 1);

  // Define how each user connection will be handled
  io.sockets.on('connection', function (socket) {
    // Assign user a guest name when they connect
    guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
    // Place user in Lobby room when they connect
    joinRoom(socket, 'Lobby');

    // Handle user messages, name change attempts, and room creation/changes
    handleMessageBroadcasting(socket, nickNames);
    handleNameChangeAttempts(socket, nickNames, namesUsed);
    handleRoomJoining(socket);

    // Provide user with list of occupied rooms on request
    socket.on('rooms', function () {
      socket.emit('rooms', io.sockets.manager.rooms);
    });

    // Define cleanup logic for when user disconnects
    handleClientDisconnection(socket, nickNames, namesUsed);
  });
};