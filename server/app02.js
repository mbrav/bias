var exports = module.exports;
var Twit = require('twit');

// primary API
var T = new Twit({
  consumer_key:         'sidVniQDxPoo3yaNs5pmivFBo',
  consumer_secret:      '88mHZa7CML1U2tarjGwPGWg3Ulm8kjLtFrM0iGKY0BQT1f0gDp',
  access_token:         '237022647-BsVts2RPYaPg6iT9HS2vkaGZk54I4Nkq5QDr4tjT',
  access_token_secret:  '33lZyypJ2UKlSrrLc1PnS8UY8FUrupsUohLuNBbfe35Rc',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
});

// backup API's (a.k.a. fuck the system)
var T2 = new Twit({
  consumer_key:         '8hGzNWjVnuuaulqsq1jLg8Odq',
  consumer_secret:      'NmPpZ3vaqJyDlGgdxPPeIt4wH58q9SuFB2Kmk4bjPy3VYYLrhj',
  access_token:         '237022647-jYWDdY4aLkRfDeH8wStaCTDtfMf1ibccDaL3HH2y',
  access_token_secret:  'GfDxBCaYKGqAm1EEpt3P8s4TG79Pq0VXEW8LMB0JKmHE1',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
});
// twitter streAMS
var stream1 = T.stream('statuses/filter', { track: '#notmypresident' });
var stream2 = T2.stream('statuses/filter', { track: ['#PresidentElectTrump', 'Dear Liberals']});

var clientsOnline = 0;

exports.connect = function() {
  clientsOnline++;
};

exports.serve = function(io, socket) {
  console.log("serving app02");
  stream1.on('tweet', function (tweet) {
    io.emit('tweetFeed1', tweet);
    console.log(tweet.text);
  });

  stream2.on('tweet', function (tweet) {
    io.emit('tweetFeed2', tweet);
    console.log(tweet.text);
  });
};

exports.disconnect = function() {
  clientsOnline--;

  if (clientsOnline == 0) {
    stream1.stop();
    stream2.stop();
  }
};
