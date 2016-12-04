//get-scraped
//created by Michael Braverman on November 12, 2016

var socket = require('socket.io-client')('http://bias-net1.local:2000');
socket.on('connect', function(){});
socket.on('event', function(data){});
socket.on('disconnect', function(){});
