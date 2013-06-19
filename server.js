var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

io.set('log level', 1);

server.listen(8082);
console.log("listening on 8082")

app.use(express.static(__dirname + '/public'));
//app.use(express.logger());

var id = 0;
var lights = {};

io.sockets.on('connection', function (socket) {

  socket.on('clicked', function(position){
    io.sockets.emit('update', position);
  });

  socket.on('update_light', function(light){
    lights[light.id] = light;
    io.sockets.emit('update_light', lights[light.id]);
  });

  io.sockets.emit('activate_light', id);
  io.sockets.emit('update_lights', lights);
  id++;

});