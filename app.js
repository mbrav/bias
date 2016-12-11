//get-scraped
//created by Michael Braverman on November 12, 2016

var express = require('express');
var app = express();
var serv = require('http').Server(app);
var request = require('request-json');
var Twit = require('twit'),
  stream1, T;
var natural = require('natural');
var io = require('socket.io')(serv, {});

var watson = require('watson-developer-cloud');
var alchemy_language = watson.alchemy_language({
  api_key: '9bd879d2dfdcb2cde467aac82d9be5c70477f349'
});

// for lcd
var Lcd = require('lcd'),
  lcd = new Lcd({
    rs: 12,
    e: 21,
    data: [5, 6, 17, 18],
    cols: 16,
    rows: 2
  });

// for running terminal commands
var childProcess = require('child_process'),
  cmd;
var talking = false;

// the id of the node
var nodeId = 1;

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});

// make everything in the /client folder available to the user
app.use(express.static('client'));

// socket.io connection port
serv.listen(2000);
console.log('SERVER STARTED');

// stat sotrage
var analysisGroups = {
  1: {
    tokens: [],
    txtBuffer: []
  }
}

var keys = [{
  consumer_key: 'sidVniQDxPoo3yaNs5pmivFBo',
  consumer_secret: '88mHZa7CML1U2tarjGwPGWg3Ulm8kjLtFrM0iGKY0BQT1f0gDp',
  access_token: '237022647-BsVts2RPYaPg6iT9HS2vkaGZk54I4Nkq5QDr4tjT',
  access_token_secret: '33lZyypJ2UKlSrrLc1PnS8UY8FUrupsUohLuNBbfe35Rc',
}, {
  consumer_key: '8hGzNWjVnuuaulqsq1jLg8Odq',
  consumer_secret: 'NmPpZ3vaqJyDlGgdxPPeIt4wH58q9SuFB2Kmk4bjPy3VYYLrhj',
  access_token: '237022647-jYWDdY4aLkRfDeH8wStaCTDtfMf1ibccDaL3HH2y',
  access_token_secret: 'GfDxBCaYKGqAm1EEpt3P8s4TG79Pq0VXEW8LMB0JKmHE1',
}, {
  consumer_key: 'aBI8PT0zVpFihiymYOsHERyTv',
  consumer_secret: '7Bug7h4LyO5YTFZrv51GwFRIv3k1kciyEstbL54tslYjTLOKg8',
  access_token: '896480534-FG5Lr9MpefI3mPUxBMc2B6rrbuQzJ2xYoF0sq9wP',
  access_token_secret: '9L5Rl2oOGb3ll7kll2xIV997vhVlFojS8eesOfxF4356k',
}, {
  consumer_key: 'xhMZCX38cmgTTcFTdfPL2SlS8',
  consumer_secret: 'ZNom2ash90VOtRe22b9BjgjW2krS67pxgj5722Mekw4weZVMhj',
  access_token: '896480534-QcW66OnJa8qu21LVUEGWAclmoQcODqROMk3sPVG0',
  access_token_secret: 'q75kz5loG1ya60ZIt8LI4tUSwRHjezwchCLOfk4wOklvR',
}]

var topics = [{
  topic: 'politics',
  tokens: [
    'trump',
    'obama',
    'clinton',
    'putin',
    'assad',
    'merkel',
    'jinping',
    'bush',
  ]
}, {
  topic: 'science',
  tokens: [
    'climate change',
    'global warming',
    'particle',
    'cern',
    'solar energy',
    'sustainability',
  ]
}, {
  topic: 'ideology',
  tokens: [
    'communism',
    'anarchy',
    'capitalism',
    'collectivism',
    'conservatism',
    'extremism',
    'fanatic',
    'fascism',
    'feminism',
    'globalism',
    'individualism',
    'industrialism',
    'intellectualism',
    'liberalism',
    'militarism',
    'nationalism',
    'socialism',
    'utilitarianism',
  ]
}, {
  topic: 'consumerisms',
  tokens: [
    'eyeliner',
    'soda',
    'shampoo',
  ]
}, {
  topic: 'marketing',
  tokens: [
    'fresh',
    'juicy',
    'tastey',
    'free',
    'guaranteed',
    'amazing',
    'instant',
    'premium'
  ]
}, {
  topic: 'celebreties',
  tokens: [
    'taylor swift',
    'justin bieber',
    'drake',
    'kim kardashian',
    'kanye west',
    'beyonce',
    'miley cyrus',
  ]
}];

var topicId, tokenId;

init();

function init() {

  socketStreamSetup();
  // // set an interval at which data is processed and emited
  // setInterval(function() {
  //
  //   // calulate td-idf
  //   calculateTfIdf(analysisGroups[1]);
  //
  //   // sort tokens
  //   sortTokens(analysisGroups[1]);
  //
  //   // send tokens to client
  //   io.emit('tokens1', analysisGroups[1].tokens.slice(0, 30));
  //
  //   // trim data
  //   trimData(analysisGroups[1]);
  //
  // }, 20000);

  // alchemyRequestInterval(15*60*1000);
}

function socketStreamSetup() {
  // set Twitter API
  T = new Twit({
    consumer_key: keys[nodeId - 1].consumer_key,
    consumer_secret: keys[nodeId - 1].consumer_secret,
    access_token: keys[nodeId - 1].access_token,
    access_token_secret: keys[nodeId - 1].access_token_secret,
    timeout_ms: 60 * 1000,
  });
  // randomize topic
  randomizeTopic();
  // twitter streAMS
  stream1 = T.stream('statuses/filter', {
    track: topics[topicId].tokens[tokenId]
  });

  function switchTopic() {
    console.log("swtiching topic");
    // randomize topic and delete previous data
    randomizeTopic();
    clearData(analysisGroups[1]);
    lcd.on('ready', function() {
  		lcd.clear(function () {
  			lcd.setCursor(0, 0);
  			lcd.print(topics[topicId].topic + ":");
  			lcd.once('printed', function() {
  				lcd.setCursor(0, 1);
  				lcd.print(topics[topicId].tokens[tokenId]);
  				lcd.once('printed', function() {
  					// lcd.clear();
  					// lcd.close();
  				});
  			});
  		});
    });
    // twitter streAMS
    stream1 = T.stream('statuses/filter', {
      track: topics[topicId].tokens[tokenId]
    });
  }
  switchTopic();

  // switch topic every 1 minutes
  var topicSwitchInterval = 60 * 1000;
  setInterval(function() {
    switchTopic();
  }, topicSwitchInterval);

  stream1.on('tweet', function(tweet) {
    // send tweet to client
    io.emit('tweetFeed1', tweet);
    // update concordance
    updateWordConcordance(tweet.text, analysisGroups[1]);
  });
}

function randomizeTopic() {
  console.log('Randomizing topic..');
  topicId = Math.round(Math.random() * (topics.length-1));
  tokenId = Math.round(Math.random() * (topics[topicId].tokens.length-1));
  console.log("New topic:", topics[topicId].topic, "New token:", topics[topicId].tokens[tokenId]);
}

function alchemyRequestInterval(delay) {
  setInterval(function() {
    if (analysisGroups[1].txtBuffer.length > 300) {
      var combinedTxt = "";
      for (var index in analysisGroups[1].txtBuffer) {
        combinedTxt += analysisGroups[1].txtBuffer[index];
      }
      alchemyRequest(combinedTxt);
    }
  }, delay);
}

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
  speak(parsedString);
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
  group.tokens = group.tokens.slice(0, 300);
  group.txtBuffer = group.txtBuffer.slice(0, 400);
}

function clearData(group) {
  for (var member in group.tokens) delete group.tokens[member];
  for (var member in group.txtBuffer) delete group.txtBuffer[member];
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

function speak(text) {
  // talk only when not currently talking, avoid overlaping
  if (!talking) {
    talking = true;
    // var cmdText = 'espeak -s50 -p160 -g8 "' + text + '"';
    var cmdText = './googleTTS.sh ' + text;
    // var cmdText = 'say -v Samantha -r 2000 "' + text + '"'; // for macOS only
    cmd = childProcess.exec(cmdText, function(error, stdout, stderr) {
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

// for AlchemyLanguage
function alchemyRequest(txt) {
  var parameters = {
    extract: 'entities,keywords,doc-sentiment',
    outputMode: 'json',
    sentiment: 1,
    maxRetrieve: 1,
    text: txt
  };

  alchemy_language.combined(parameters, function(err, response) {
    if (err)
      console.log('error:', err);
    else
      console.log(JSON.stringify(response, null, 2));
  });
}

// for concept net, UNUSED
function conceptNet(word) {
  var client = request.createClient('http://api.conceptnet.io/c/en/');
  client.get(word, function(err, res, body) {
    return body;
  });
}
