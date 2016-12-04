//get-scraped
//created by Michael Braverman on November 12, 2016

var request = require('request-json');
var Twit = require('twit');
var natural = require('natural');

var masterPort = 3000;
var ioc = require('socket.io-client');
var client = ioc.connect("http://localhost:" + masterPort);

client.once("connect", function() {
  console.log('SLAVE SERVER STARTED');
  console.log('Client: Connected to port ' + masterPort);

  client.emit("msg", "Hello World");
});

// for running terminal commands
var childProcess = require('child_process'),
  cmd;
var talking = false;

// // for lcd
// var Lcd = require('lcd'),
//   lcd = new Lcd({
//     rs: 12,
//     e: 21,
//     data: [5, 6, 17, 18],
//     cols: 16,
//     rows: 2
//   });

// stat sotrage
var analysisGroups = {
  1: {
    tokens: [],
    txtBuffer: []
  },
  2: {
    tokens: [],
    txtBuffer: []
  }
}

init();

function init() {
  // setup socket and twitter stream
  socketStreamSetup();
  // set an interval at which data is processed and emited
  emitDataInterval(10000);
}

function socketStreamSetup() {
  // primary API
  var T = new Twit({
    consumer_key: 'sidVniQDxPoo3yaNs5pmivFBo',
    consumer_secret: '88mHZa7CML1U2tarjGwPGWg3Ulm8kjLtFrM0iGKY0BQT1f0gDp',
    access_token: '237022647-BsVts2RPYaPg6iT9HS2vkaGZk54I4Nkq5QDr4tjT',
    access_token_secret: '33lZyypJ2UKlSrrLc1PnS8UY8FUrupsUohLuNBbfe35Rc',
    timeout_ms: 60 * 1000,
  });

  // backup API's (a.k.a. fuck the system)
  var T2 = new Twit({
    consumer_key: '8hGzNWjVnuuaulqsq1jLg8Odq',
    consumer_secret: 'NmPpZ3vaqJyDlGgdxPPeIt4wH58q9SuFB2Kmk4bjPy3VYYLrhj',
    access_token: '237022647-jYWDdY4aLkRfDeH8wStaCTDtfMf1ibccDaL3HH2y',
    access_token_secret: 'GfDxBCaYKGqAm1EEpt3P8s4TG79Pq0VXEW8LMB0JKmHE1',
    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  });

  // twitter streAMS
  var stream1 = T.stream('statuses/filter', {
    track: ['kardashian']
  });
  var stream2 = T2.stream('statuses/filter', {
    track: ['syria']
  });

  stream1.on('tweet', function(tweet) {
    // send tweet to client
    client.emit('tweetFeed1', tweet);
    // update concordance
    updateWordConcordance(tweet.text, analysisGroups[1]);
  });

  stream2.on('tweet', function(tweet) {
    // send tweet to client
    client.emit('tweetFeed2', tweet);
    // update concordance
    updateWordConcordance(tweet.text, analysisGroups[2]);
  });
}

function emitDataInterval(delay) {
  // calculate and transmit >sorted< conocordences every 5 seconds
  setInterval(function() {

    // calulate td-idf
    calculateTfIdf(analysisGroups[1]);
    calculateTfIdf(analysisGroups[2]);

    // sort tokens
    sortTokens(analysisGroups[1]);
    sortTokens(analysisGroups[2]);

    // send tokens to client
    client.emit('tokens1', analysisGroups[1].tokens.slice(0, 30));
    client.emit('tokens2', analysisGroups[2].tokens.slice(0, 30));

    // trim data
    trimData(analysisGroups[1]);
    trimData(analysisGroups[2]);

    console.log("Tokens1 lenght: " + analysisGroups[1].tokens.length);
    console.log("Tokens2 lenght: " + analysisGroups[2].tokens.length);

  }, delay);
}

function eSpeak(text) {
  // talk only when not currently talking, avoid overlaping
  if (!talking) {
    talking = true;
    lcd.print(text);
    var cmdText = 'echo "' + text + '" | festival --tts';
    cmd = childProcess.exec(cmdText, function(error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      console.log("voice ON");
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
    cmd.on('exit', function(code) {
      console.log("voice OFF");
      talking = false;
    });
  }
}

// function eSpeak(text) {
//   child_process.spawn('espeak "' + text + '"', [args], [options])
// }

// Based on Bryan Ma's "Concordances / Word Counting"
// https://github.com/whoisbma/Code-2-SP16/tree/master/week-06-concordance
function updateWordConcordance(string, group) {
  var parsedString = string.replace(/\s+/g, " ")
    .replace(/([^a-zA-Z ]|http|https)/g, "") // remove symbols and links
    .replace("RT", "") // exclude retweet signs
    .replace(" ", "") // exclude spaces signs
    .replace(/\b(@)\w\w+/g, "1917!!") // exclude usernames
    .toLowerCase();
  var words = parsedString.split(" ");
  group.txtBuffer.push(parsedString); // push to strings
  eSpeak(parsedString);
  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    // console.log(word, group.tokens[tokens.indexOf(word)] tokens.indexOf(word));
    //if its a new word:
    if (checkForWord(group.tokens, word) == false) {
      group.tokens.push({
        word: word,
        count: 1
      });
    } else { // if we've seen this word before, increment the value:
      var wordIndex = getIndexOfWord(group.tokens, word);
      group.tokens[wordIndex].count++;
      // console.log("Word: " + group.tokens[wordIndex].word + ", count: " + group.tokens[wordIndex].count);
    }
  }
}

// If ctrl+c is hit, free resources and exit.
process.on('SIGINT', function() {
  lcd.close();
  process.exit();
});

function checkForWord(array, word) {
  var wordFound = false;
  for (var i = 0; i < array.length; i++) {
    if (array[i].word == word) {
      wordFound = true;
    }
  }
  return wordFound;
}

function getIndexOfWord(array, word) {
  var index = 0;
  for (var i = 0; i < array.length; i++) {
    if (array[i].word == word) {
      index = i;
      break;
    }
  }
  return index;
}

// use sparangly on large datasets
function sortTokens(group) {

  // sort tokens by count
  // group.tokens.sort(function(a, b) {
  // 	return (b.count - a.count);
  // });

  // sprt tokens by idf
  group.tokens.sort(function(a, b) {
    return (b.avgIdf - a.avgIdf);
  });
}

function trimData(group) {
  group.tokens = group.tokens.slice(0, 1000);
  group.txtBuffer = group.txtBuffer.slice(0, 1000);
}

function calculateTfIdf(group) {
  tfidf = new natural.TfIdf();

  // add all sentences to the tfidf calculator
  for (var i in group.txtBuffer) {
    tfidf.addDocument(group.txtBuffer[i]);
  }

  // go throught all words and average their tf-idf
  for (var i in group.tokens) {
    var avg = 0.0;
    var count = 0;
    tfidf.tfidfs(group.tokens[i].word, function(i, measure) {
      avg += measure;
      count++;
    });
    group.tokens[i].avgIdf = avg / count;
  }
}

// for concept net, UNUSED
function conceptNet(word) {
  var client = request.createClient('http://api.conceptnet.io/c/en/');
  client.get(word, function(err, res, body) {
    return body;
  });
}
