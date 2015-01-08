var express = require('express'),
    app = express(app),
    server = require('http').createServer(app);

var io = require('socket.io')(server);
var socket = require('./js/gameController.js')(io);

app.use(express.static(__dirname));

app.get('/', function(request, response)
{
  response.sendfile('index.html');
});

var port = process.env.PORT || 8000;

server.listen(port, function()
{
  console.log("listening on port" + port);
});
