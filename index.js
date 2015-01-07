var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);

// serve static files from the current directory
app.use(express.static(__dirname));

//we'll keep clients data here
//var clients = {};

//get EurecaServer class
//var EurecaServer = require('eureca.io').EurecaServer;
var io = require('socket.io')(server);
var socket = require('./js/gameController.js')(io);



app.get('/', function(request, response) {
  response.sendfile('index.html');
});

var port = process.env.PORT || 8000;
server.listen(port, function() {
  console.log("listening on port" + port);
});
