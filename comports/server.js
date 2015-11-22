var port = process.argv[2] || 'COM5';	
var SerialPort = require('serialport').SerialPort;
var serialport = new SerialPort(port);
console.log();
serialport.on('open', function() {
	console.log('Serial Port Opened: ' + port);
	serialport.on('data', function(data) {
		var buffer = new Buffer(data);
		console.log(buffer.toString());
	})
});