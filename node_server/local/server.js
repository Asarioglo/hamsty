var express = require('express');
var serverConfig = require('./configs/configs.json');
var io = require('socket.io-client');
var sp = require('serialport');
var SerialPort = sp.SerialPort;
var com_port = 'COM5';
var serialport = new SerialPort(com_port, {
    parser: sp.parsers.readline('\n')
});
var _portopen = false;

// initialize port connection state listeners
serialport.on('open', function() {
    console.log('COM port opened');
    _portopen = true;
});
serialport.on('close', function() {
    _portopen = false;
});

app = express();

var ipaddress, port;
var _speed = null;
var _last_speed_reading = null;
var _speed_timeout = 1000;
var _distance = 35;
var _distance_counter = 0;
var _distance_travelled = 0;
var _temp = null;
var _humid = null;
var _status = 0;
var _water_level = null;
var _fan = false;
var _lights = false;


var setupVariables = function() {
	ipaddress = serverConfig.ip;
	port = serverConfig.port;
};

var terminator = function(sig) {
	if(typeof sig === "string") {
		process.exit(1);
	}
};

var setupTerminationHandlers = function () {
    //  Process on exit and signals.
    process.on('exit', function () {
        terminator();
    });

    // Removed 'SIGPIPE' from the list - bugz 852598.
    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
        'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach(function (element, index, array) {
            process.on(element, function () {
                terminator(element);
            });
        });
};

setInterval(function() {
    var time = new Date();
    console.log('TimeDifference' + (time - _last_speed_reading));
    if(Math.abs(time - _last_speed_reading) > _speed_timeout) {
        _speed = null;
    }
}, 1000);

setupVariables();
setupTerminationHandlers();

app.configure(function () {
    app.use(function(req, res, next) {
        res.setHeader("Connection", "close");
        return next();
    });
});

var server = app.listen(port, ipaddress, function() {
	console.log('Server Started at ' + ipaddress + ':' + port);
});


var socket = io.connect('http://hamsty.com');
var data_buff = '';
socket.on('connected', function() {
    var sendData = function() {
        var data = {
            temperature: _temp || 'null',
            humidity: _humid || 'null',
            status: 1,
            speed: _speed || 'null',
            water: _water_level || 'null',
            distance: _distance_travelled,
            fanon: _fan ? 1 : 0,
            lightson: _lights ? 1 : 0
        };
        console.log(data);
        socket.emit('dataTransfer', data);
    };

    serialport.on('data', function(data) {
        if(data_buff != data) {
            var values = data.split(':');
            switch(values[0]) {
                case 'h':
                    _humid = +values[1];
                    break;
                case 't':
                    _temp = +values[1];
                    break;
                case 'w':
                    _water_level = +values[1];
                    break;
                case 's':
                    console.log('speed received');
                    _speed = +values[1].split(';')[0];
                    _distance_travelled = ++_distance_counter * _distance / 1000;
                    _last_speed_reading = new Date();
                    break;
            }
            data_buff = data;
            sendData();
        }
    });
});

socket.on('feedhamster', feedHamster);
socket.on('togglefan', toggleFan);
socket.on('togglelights', toggleLights);

function feedHamster() {
    if(_portopen) {
        serialport.write('m', function(err) {
            if(err) {
                console.log('Error feeding hamster with Arduino');
                return socket.emit('feedingfailed');
            }
            console.log('Hamster Fed Successfully');
            socket.emit('hamsterfed');
        });
    } else {
        console.log('COM communication is not opened, Could not feed hamsty');
        socket.emit('feedingfailed');
    }
}

function toggleFan() {
    if(_portopen) {
        serialport.write('f', function(err) {
            if(err) {
                console.log('Error toggling fan Arduino');
                return socket.emit('fanfailed');
            }
            console.log('Fan toggled successfully');
            _fan = !_fan;
            socket.emit('fantoggled');
        });
    } else {
        console.log('COM communication is not opened, Could not toggle fan');
        socket.emit('fanfailed');
    }
}
//
function toggleLights() {
    if(_portopen) {
        serialport.write('l', function(err) {
            if(err) {
                console.log('Error toggling lights Arduino');
                return socket.emit('lightsfailed');
            }
            console.log('Light toggled successfully');
            _lights = !_lights;
            socket.emit('lightstoggled');
        });
    } else {
        console.log('COM communication is not opened, Could not toggle lights');
        socket.emit('lightsfailed');
    }
}