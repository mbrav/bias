// socket init
var socket = io();

init();

var feed, terminal;
var clientsOnline;

function init() {
  feed = document.getElementById("feed");
  terminal = document.getElementById("terminal");
  // send client settings
  socket.emit('init', {
    pageId: 1
  });

  for (var i = 0; i < emails.length; i++) {

    $('#feed')
      .append($('<h1>').text(emails[i].subject))
      .append($('<h2>').text(emails[i].from))
      .append($('<h2>').text("To: " + emails[i].to))
      .append($('<h2>').text("Time: " + emails[i].timestamp))
      .append($('<p>').text(emails[i].body));
  }

  socket.on('newClient', function(msg){
    console.log(msg);
    clientsOnline = msg.clientsOnline;
    updateBasedOnClientsOnline();
    var terminalMessage = document.createElement("p");

    $('#terminal').append(
      $('<p>').html(
        "<span>USER CONNECTS</span>"
        + " <b> IP: </b>"
        + msg.host
        + " <b> AGENT: </b>"
        + msg.agent
        + "<br> <b> "
        + msg.clientsOnline
        + "</b> users remain online "
      ));
  });

  socket.on('clientDisconnect', function(msg){
    clientsOnline = msg.clientsOnline;
    updateBasedOnClientsOnline();

    $('#terminal').append(
      $('<p>').html(
        "<span>USER DISCONNECTS</span> <br> <b>"
        + msg.clientsOnline
        + "</b> users remain online"
      ));
  });

  socket.on('serverMessage', function(msg){
    $('#terminal').append($('<p>').html(
      "<i>"
      + msg.msg
      + "</i>"
      ));
  });
}

function updateBasedOnClientsOnline() {
  feed.style.opacity = opacityFormula(clientsOnline);
  console.log(opacityFormula(clientsOnline));
}

function opacityFormula(usersOnline) {
  return Math.exp(usersOnline/60)-1;
}
