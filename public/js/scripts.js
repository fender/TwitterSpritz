$(function() {
  var socket = io.connect('http://localhost');

  socket.on('tweet', function (data) {
    str = data.text;
    regex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    str = str.replace(regex, '');

    $('.feed').append(str + '.');
    ospritz.refresh($('.feed').html(), $('#word'), parseInt($('#wpm').val()));
  });

  ospritz.init($('.feed').html(), $('#word'), parseInt($('#wpm').val()));
});
