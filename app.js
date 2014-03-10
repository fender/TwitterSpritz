var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , util = require('util')
  , twitter = require('twitter');

var twit = new twitter({
    consumer_key: 'ADD HERE',
    consumer_secret: 'ADD HERE',
    access_token_key: 'ADD HERE',
    access_token_secret: 'ADD HERE'
});

server.listen(80);

app.use(express.static( __dirname + '/public'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

io.sockets.on('connection', function (socket) {
  twit.stream('user', {track: 'awesome'}, function(stream) {
    stream.on('data', function(data) {
      if (data.text) {
        socket.emit('tweet', {text: data.text});
      }
    });
  });
});

