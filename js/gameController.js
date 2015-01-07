var socket = function(io) {

  var clients = {}

  io.on('connection', function(socket){
    console.log(socket.id + ' connected');
    clients[socket.id] = { id: socket.id };
    socket.emit('user joined', socket.id);

    socket.on('disconnect', function() {
      io.emit('kill', socket.id);
      delete clients[socket.id];
      console.log(socket.id + ' disconnected');
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
