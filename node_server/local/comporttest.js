/**
 * Created by Alexandr on 11/21/2015.
 */
var SerialPort = require('serialport').SerialPort;
var com_port = 'COM6';
var serialport = new SerialPort(com_port);
var _portopen = false;

// initialize port connection state listeners
serialport.on('open', function() {
    console.log('Opened');
    _portopen = true;
    serialport.write('w', function(err) {
        if(err) {
            return console.log('Error');
        }
        console.log('Data Sent');
    });

});
serialport.on('close', function() {
    console.log('Closed');
    _portopen = false;
});