var socket = function(io) {

  var clients = {}

  io.on('connection', function(socket){
    console.log(socket.id + ' connected');
    clients[socket.id] = { id: socket.id };
    console.log(clients);
    socket.emit('user joined', socket.id);

    socket.on('disconnect', function() {
      delete clients[socket.id];
      console.log(socket.id + ' disconnected');
      console.log(clients);
      socket.emit('kill', socket.id);
    });

    socket.on('handshake', function() {
      for (var c in clients)
      {
        //send latest known position
        var x = clients[c].laststate ? clients[c].laststate.x:  0;
        var y = clients[c].laststate ? clients[c].laststate.y:  0;
        io.emit('spawn enemy', clients[c].id, x, y);
      }
    });

    socket.on('handleKeys', function(keys) {
      io.emit('updateState', socket.id, keys);
      clients[socket.id].laststate = keys;
    });

  });

};

module.exports = socket;
