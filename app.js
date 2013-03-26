
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();
var usernames = {};

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(8080);

io.sockets.on('connection', function(socket){
  socket.emit('news', {hello: 'world'});
  socket.on('sendchat', function(data){
    io.sockets.emit('updatechat', socket.username, data);
  });
  socket.on('adduser', function(username){
    socket.username = username;
    usernames[username] = username;
    socket.emit('updatechat', 'SERVER', 'te has conectado.');
    socket.broadcast.emit('updatechat', 'SERVER', username + ' se ha conectado.');
    io.sockets.emit('updateusers', usernames);
  });
  socket.on('disconnect', function(){
    delete usernames[socket.username];
    io.sockets.emit('updateusers', usernames);
    socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' abandono la sala.');
  });
  socket.on('my other event', function(data){
    console.log(data);
  });
});

console.log('servidor iniciado en 8080');
