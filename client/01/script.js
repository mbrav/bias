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

function init() {
  // send client settings
  socket.emit('init', {
    pageId: 1
  });

  socket.on('tweetFeed1', function(tweet){
    // update feed
    $('#feed1').prepend(
      $('<p>').html(tweet.text)
    );

    // display stats
    calculateStats(tweet, stats.one);
    $('#stats1').empty();
    $('#stats1').append($('<b>').html("Average Total Tweets per Account"))
      .append($('<p>').html(Math.round(stats.one.avgTweetsPerUser)));
    $('#stats1').append($('<b>').html("Average Account Age"))
      .append($('<p>').html(Math.round(stats.one.avgAccountAgeDays) + " days"));
  });

  socket.on('tweetFeed2', function(tweet){
    // update feed
    $('#feed2').prepend(
      $('<p>').html(tweet.text)
    );

    // display stats
    calculateStats(tweet, stats.two);
    $('#stats2').empty();
    $('#stats2').append($('<b>').html("Average Total Tweets per Account"))
      .append($('<p>').html(Math.round(stats.two.avgTweetsPerUser)));
    $('#stats2').append($('<b>').html("Average Account Age"))
      .append($('<p>').html(Math.round(stats.two.avgAccountAgeDays) + " days"));
  });

  socket.on('concordance1', function(data){
    console.log(data);
  });
  socket.on('concordance2', function(data){
    console.log(data);
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
