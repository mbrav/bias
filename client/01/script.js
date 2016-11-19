// socket init
var socket = io();

init();

var stats = {
  one : {
    counts : 0,
    avgTweetsPerUser: 0,
    totalStatusUpdates: 0,
    avgAccountAge: 0,
    totalAccountAge: 0,
  },
  two : {
    counts : 0,
    avgTweetsPerUser: 0,
    totalStatusUpdates: 0,
    avgAccountAge: 0,
    totalAccountAge: 0,
  }
};

var tokens1, tokens2;

function init() {
  // send client settings
  socket.emit('init', {
    pageId: 1
  });

  socket.on('tweetFeed1', function(tweet){
    var feed = $('#feed1');
    var stat = $('#stats1');

    // update feed
    feed.prepend(
      $('<p>').html(tweet.text)
    );

    // display stats
    calculateStats(tweet, stats.one);
    stat.empty();

    // update word list
    stat.append($('<b>').html("Top Words"))
    stat.append($('<div>').attr('id', 'words1'));
    if (tokens1 != null) {
      for (var i = 0; i < 30 && tokens1.length; i++) {
        stat.append($('<p>').html(
          "<b>" +
          (i + 1) + "</b> <u>"
          + tokens1[i].word.capitalize()
          + "</u>, avgidf: "
          + tokens1[i].avgIdf.toFixed(3)
        ));
      }
    }

    stat.append($('<b>').html("Average Total Tweets per Account"))
      .append($('<p>').html(Math.round(stats.one.avgTweetsPerUser)));
    stat.append($('<b>').html("Average Account Age"))
      .append($('<p>').html(Math.round(stats.one.avgAccountAgeDays) + " days"));
  });

  socket.on('tweetFeed2', function(tweet){
    var feed = $('#feed2');
    var stat = $('#stats2');

    // update feed
    feed.prepend(
      $('<p>').html(tweet.text)
    );

    // display stats
    calculateStats(tweet, stats.two);
    stat.empty();

    // update word list
    stat.append($('<b>').html("Top Words"))
    stat.append($('<div>').attr('id', 'words2'));
    if (tokens2 != null) {
      for (var i = 0; i < 30 && tokens1.length; i++) {
        stat.append($('<p>').html(
          "<b>" +
          (i + 1) + "</b> <u>"
          + tokens2[i].word.capitalize()
          + "</u>, avgidf: "
          + tokens2[i].avgIdf.toFixed(3)
        ));
      }
    }

    stat.append($('<b>').html("Average Total Tweets per Account"))
      .append($('<p>').html(Math.round(stats.two.avgTweetsPerUser)));
    stat.append($('<b>').html("Average Account Age"))
      .append($('<p>').html(Math.round(stats.two.avgAccountAgeDays) + " days"));
  });

  socket.on('tokens1', function(data){
    tokens1 = data;
  });

  socket.on('tokens2', function(data){
    tokens2 = data;
  });
}

// calculateStats(tweet, stats.one)
function calculateStats(tweet, data) {
  // used for avergaing up variables
  data.counts += 1;

  var currentDate = Date.now();
  var userCreatedDate = Date.parse(tweet.user.created_at);

  data.totalAccountAge += (currentDate - userCreatedDate);
  data.avgAccountAge = data.totalAccountAge/data.counts;
  data.avgAccountAgeDays = data.avgAccountAge / (1000*60*60*24);

  data.totalStatusUpdates += tweet.user.statuses_count;
  data.avgTweetsPerUser = data.totalStatusUpdates/data.counts;
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
