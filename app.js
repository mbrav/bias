//get-scraped
//created by Michael Braverman on November 12, 2016

var express = require('express');
var app = express();
var serv = require('http').Server(app);
var request = require('request-json');
var Twit = require('twit');
var natural = require('natural');

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

// make everything in the /client folder available to the user
app.use(express.static('client'));

// socket.io connection port
serv.listen(2000);
console.log('SERVER STARTED');

var clientsOnline = 0;

// stat sotrage
var analysisGroups = {
	1 : {
		concordance: {},
		tokens: [],
		txtBuffer: []
	},
	2 : {
		concordance: {},
		tokens: [],
		txtBuffer: []
	}
}

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
var stream1 = T.stream('statuses/filter', { track: ['putin']});
var stream2 = T2.stream('statuses/filter', { track: ['assange']});

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket) {
	// var concept = conceptNet("omg");
  clientsOnline++;

  // setup the client once his settings are received
	console.log("CLIENT connected");

  socket.on('init', function(msg) {
		console.log("INIT client message");
		console.log(msg);

    console.log("SERVING page ID " + msg.pageId + " to client");
		console.log("serving app");
	  stream1.on('tweet', function (tweet) {
			// send tweet to client
			socket.emit('tweetFeed1', tweet);
			// update concordance
			updateWordConcordance(tweet.text, analysisGroups[1]);
	  });

	  stream2.on('tweet', function (tweet) {
			// send tweet to client
			socket.emit('tweetFeed2', tweet);
			// update concordance
			updateWordConcordance(tweet.text, analysisGroups[2]);
	  });
  });

  socket.on('disconnect', function() {
    clientsOnline--;
  });
});

// calculate and transmit >sorted< conocordences every 5 seconds
setInterval(function () {

	// calulate td-idf
	calculateTfIdf(analysisGroups[1]);
	calculateTfIdf(analysisGroups[2]);

	// sort tokens
	sortTokens(analysisGroups[1]);
	sortTokens(analysisGroups[2]);

	// send tokens to client
	io.emit('tokens1', analysisGroups[1].tokens.slice(0,100));
	io.emit('tokens2', analysisGroups[2].tokens.slice(0,100));

}, 5000);

// Based on Bryan Ma's "Concordances / Word Counting"
// https://github.com/whoisbma/Code-2-SP16/tree/master/week-06-concordance
function updateWordConcordance(string, group) {
	var concord = group.concordance;
	var tokens = group.tokens;
	var buffer = group.txtBuffer;

	var parsedString = string.replace(/\s+/g, " ")
		.replace(/([^a-zA-Z ]|http|https)/g, "") // remove symbols and links
		.replace("RT", "") // exclude retweet signs
		.replace(/\b(@)\w\w+/g, "1917!!") // exclude usernames
		.toLowerCase();
	var tokens = parsedString.split(" ");
	buffer.push(parsedString); // push to strings
	for (var i = 0; i < tokens.length; i++) {
    var word = tokens[i];
    //if its a new word:
    if (concord[word] === undefined) {
      //create the key (the word) and value (1) in the concordance object:
      concord[word] = 1;
			group.tokens.push({
				word: word,
				count: 1
			});  //if we have a new word, add it to the array.
    } else { // if we've seen this word before, increment the value:
      concord[word] ++;
    }
  }
}

// use sparangly on large datasets
function sortTokens(group) {
	var concord = group.concordance;

	// update the tokened words with their count
	for (var i in group.tokens) {
		group.tokens[i].count = concord[group.tokens[i].word];
	}

	// sort tokens by count
	// group.tokens.sort(function(a, b) {
	// 	return (b.count - a.count);
	// });

	// sprt tokens by idf
	group.tokens.sort(function(a, b) {
		return (b.avgIdf - a.avgIdf);
	});
}

function calculateTfIdf(group) {
  tfidf = new natural.TfIdf();
	// var concord = group.concordance;
	var tokens = group.tokens;
	var buffer = group.txtBuffer;

	// add all sentences to the tfidf calculator
	for (var i in buffer) {
		tfidf.addDocument(buffer[i]);
	}

	// go throught all words and average their tf-idf
	for (var i in tokens) {
		var avg = 0.0;
		var count = 0;
		tfidf.tfidfs(tokens[i].word, function(i, measure) {
	    avg += measure;
			count ++;
		});
		group.tokens[i].avgIdf = avg/count;
	}
}

// for concept net, UNUSED
function conceptNet(word) {
	var client = request.createClient('http://api.conceptnet.io/c/en/');
	client.get(word, function(err, res, body) {
		return body;
	});
}
