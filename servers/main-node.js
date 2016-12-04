//get-scraped
//created by Michael Braverman on November 12, 2016

var port = 3000;
var server = require( 'http' ).createServer( ).listen( port, function () {
    console.log('MASTER SERVER STARTED');
} );
var io = require( 'socket.io' ).listen( server );

var SerialPort = require('serialport'),
//serialPort = new SerialPort('/dev/ttyUSB0', {
serialPort = new SerialPort('/dev/serial0', {
  baudrate: 19200
}),
Printer = require('thermalprinter');
var printer = new Printer(serialPort);

io.sockets.on( "connection", function ( node ) {
  console.log("SOCKET CONNECTED");
  node.on( "tokens1", function (tokens) {
  });
  node.on( "tokens2", function (tokens) {
  });
  node.on( "txtBuffer1", function (buffer) {
    console.log("PRINTING: ", buffer[0]);
  });
  node.on( "txtBuffer2", function (buffer) {
    console.log(buffer);
  });
});

setInterval(function() {
  printerPrint("HI" + MAth.random());
}, 5000);

function printerPrint(string) {
  serialPort.on('open', function() {
    printer.on('ready', function() {
      printer
        .indent(10)
        .horizontalLine(16)
        .bold(true)
        .indent(10)
        .printLine(string) // print passed string
        .print(function() {
          console.log('done');
          process.exit();
        });
    });
  });
}
