var socket = function(io) {

  var clients = {}

  io.on('connection', function(socket){
    var socketIdString = socket.id.toString();
    console.log(socket.id + ' connected');
    clients[socketIdString] = socket.id;
    socket.emit('user joined', socketIdString);

    socket.on('handshake', function() {
      for (var c in clients)
      {
        var x = clients[c].laststate ? clients[c].laststate.x:  0;
        var y = clients[c].laststate ? clients[c].laststate.y:  0;
        cString = c.toString();
        io.emit('spawn enemy', cString, x, y);  // send x and y with c
        console.log(cString + ' sent to spawn');
      }
        console.log(clients);
    });

    socket.on('handleKeys', function(keys) {
        var socketIdString = socket.id.toString();
        io.emit('updateState', socketIdString, keys);
        clients[socket.id].laststate = keys;
    });

    socket.on('disconnect', function() {
      var socketIdString = socket.id.toString();
      io.emit('kill', socketIdString);
      io.emit('dc', socketIdString);
      delete clients[socket.id];
      console.log(socket.id + ' disconnected');
    });
  });

};

module.exports = socket;
