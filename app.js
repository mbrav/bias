//get-scraped
//created by Michael Braverman on November 12, 2016

var express = require('express');
var app = express();
var serv = require('http').Server(app);
var Twit = require('twit');

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

// make everything in the /client folder available to the user
app.use(express.static('client'));

// socket.io connection port
serv.listen(2000);
console.log('SERVER STARTED');

var clientsOnline = 0;

// primary API
var T = new Twit({
	consumer_key:         'sidVniQDxPoo3yaNs5pmivFBo',
	consumer_secret:      '88mHZa7CML1U2tarjGwPGWg3Ulm8kjLtFrM0iGKY0BQT1f0gDp',
	access_token:         '237022647-BsVts2RPYaPg6iT9HS2vkaGZk54I4Nkq5QDr4tjT',
	access_token_secret:  '33lZyypJ2UKlSrrLc1PnS8UY8FUrupsUohLuNBbfe35Rc',
	timeout_ms:           60*1000,
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

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket) {

  clientsOnline++;

  // setup the client once his settings are received
	console.log("CLIENT connected");

  socket.on('init', function(msg) {
		console.log("INIT client message");
		console.log(msg);

    // serve different things based on pageId
    if (msg.pageId == 1) {
      console.log("SERVING page ID " + msg.pageId + " to client");
			console.log("serving app");
		  stream1.on('tweet', function (tweet) {
		    socket.emit('tweetFeed1', tweet);
		    console.log(tweet.text);
		  });

		  stream2.on('tweet', function (tweet) {
		    socket.emit('tweetFeed2', tweet);
		    console.log(tweet.text);
		  });
    }
  });

  socket.on('disconnect', function() {
    clientsOnline--;
  });
});
