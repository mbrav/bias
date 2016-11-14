//get-scraped
//created by Michael Braverman on November 12, 2016

var express = require('express');
var app = express();
var serv = require('http').Server(app);

// apps seprated into seprate files
var app01 = require("./server/app01.js");
var app02 = require("./server/app02.js");

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

// make everything in the /client folder available to the user
app.use(express.static('client'));

// socket.io connection port
serv.listen(2000);
console.log('SERVER STARTED');

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket) {

  app01.connect();
  app02.connect();

  // setup the client once his settings are received
	console.log("CLIENT connected");

  socket.on('init', function(msg) {
		console.log("INIT client message");
		console.log(msg);

    // serve different things based on pageId
    if (msg.pageId == 1) {
      console.log("SERVING page ID " + msg.pageId + " to client");
      app01.serve(io, socket);
    }

    // serve different things based on pageId
    if (msg.pageId == 2) {
      console.log("SERVING page ID " + msg.pageId + " to client");
      app02.serve(io, socket);
    }
  });

  socket.on('disconnect', function() {
    app01.disconnect();
    app02.disconnect();
  });
});
