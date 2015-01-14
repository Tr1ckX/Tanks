var socket = function(io) {

  var clients = {}

  io.on('connection', function(socket){
    var socketIdString = socket.id.toString();
    console.log(socket.id + ' connected');
    clients[socketIdString] = socket.id;
    socket.emit('user joined', socketIdString);

    // setInterval(function() { console.log('-------clients hash--------')}, 3000);
    // setInterval(function() { console.log(clients)}, 3000);

    socket.on('handshake', function(){
      for (var c in clients)
      {
        var x = clients[c].laststate ? clients[c].laststate.x:  0;
        var y = clients[c].laststate ? clients[c].laststate.y:  0;
        cString = c.toString();
        io.emit('spawn enemy', cString, x, y); // send x and y with c
        console.log(cString);
      }
    });

    socket.on('playerDataToServer', function(state) {
        var socketIdString = socket.id.toString();
        clients[socket.id].laststate = state;
        io.emit('updateState', socketIdString, state);
    });

    socket.on('disconnect', function() {
      console.log(socket.id + ' disconnected');
      var socketIdString = socket.id.toString();
      io.emit('deleteDisconnected', socketIdString);
      delete clients[socket.id];
    });
  });

};

module.exports = socket;


// io.to('client_address').emit('id','message');
