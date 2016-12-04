//get-scraped
//created by Michael Braverman on November 12, 2016

var port = 3000;
var server = require( 'http' ).createServer( ).listen( port, function () {
    console.log('MASTER SERVER STARTED');
} );
var io = require( 'socket.io' ).listen( server );

var SerialPort = require('serialport'),
//serialPort = new SerialPort('/dev/ttyUSB0', {
serialPort = new SerialPort('/dev/ttyS0', {
  baudrate: 19200
}),
Printer = require('thermalprinter');

io.sockets.on( "connection", function ( node ) {
  console.log("SOCKET CONNECTED");
  node.on( "tokens1", function (tokens) {
  });
  node.on( "tokens2", function (tokens) {
  });
  node.on( "txtBuffer1", function (buffer) {
    printerPrint("test");
  });
  node.on( "txtBuffer2", function (buffer) {
  });
});


function printerPrint(string) {
  console.log("PRINTER printing: ", string);
  serialPort.on('open', function() {
    console.log("PRINTER open");
    var printer = new Printer(serialPort);
    printer.on('ready', function() {
      onsole.log("PRINTER ready");
      console.log("PRINTING: ", string);
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
