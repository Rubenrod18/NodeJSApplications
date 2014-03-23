var Chat = function (socket) {
  this.socket = socket;
};

Chat.prototype.sendMessage = function (room, text) {
  var message = {
    room: room,
    text: text
  };
  this.socket.emit('message', message);
};

Chat.prototype.changeRoom = function (room) {
  this.socket.emit('join', {
    newRoom: room
  });
};

Chat.prototype.processCommand = function (command) {
  var words = command.split(' ');
  // Parse command from first word
  command = words[0]
                    .substring(1, words[0].length)
                    .toLowerCase();
  var message = false;

  switch (command) {
  case 'join':
    words.shift();
    var room = words.join(' ');
    this.changeRoom(room); // Handle room changing/creating
    break;
  case 'nick':
    words.shift();
    var name = words.join(' ');
    this.socket.emit('nameAttempt', name); // Handle name change attempts
    break;
  default:
    // Return error message if command isn’t recognized
    message = 'Unrecognized command.';
    break;
  } // switch

  return message;
};