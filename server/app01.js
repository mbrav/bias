var exports = module.exports;

var clientsOnline = 0;

exports.connect = function() {
  clientsOnline++;
};

exports.serve = function(io, socket) {
  console.log("serving app01");
  // update socket data when new position recieved from a player
  socket.on('init', function(msg) {
    console.log("new client connected");
    console.log(msg);

    io.emit('newClient', {
      clientsOnline: clientsOnline,
      host: socket.handshake.headers.host,
      agent: socket.handshake.headers["user-agent"]
    });

    // disconnect player when he leaves
    socket.on('disconnect', function() {
      console.log("Client disconnect");
      clientsOnline--;
      io.emit('clientDisconnect', {
        clientsOnline: clientsOnline
      });
    });
  });
};

exports.disconnect = function() {
  clientsOnline--;
};
