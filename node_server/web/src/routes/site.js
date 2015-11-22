var url = require('url');
var promise = require('promise');
var fs = require('fs');
var request = require('request');
var Promise = require("promise");
var ejs = require('ejs');
var io = require('socket.io');

var normalizeTime = function(date) {
	var seconds = date.getSeconds();
	var minutes = date.getMinutes();
	var hour = date.getHours();
	return hour + ':' + minutes + ':' + seconds;
};

var _temp = 0;
var _hum = 0;
var _stat = 0;
var _socket = null;
var _speed = [{speed: 0, time: normalizeTime(new Date())}];
var _prev_speed = 0.0;
var _cur_speed = 0.0;
var _distance = 0;
var _cal = 0;
var _cal_const = 30;
var _water = 0;
var _fanon = 0;
var _lightson = 0;
var users = {};

var initial = function(req, res) {
	res.render('index.ejs');
};

var generalData = function(req, res) {
	var beginning = _speed.length > 100 ? _speed.length - 100 : 0;
	res.json({
		temperature: _temp,
		humidity: _hum,
		status: _cur_speed > 0 ? 1 : 2,
		speed: _speed.slice(beginning),
		current_speed: _cur_speed,
		distance: _distance,
		calories: _cal,
		waterlevel: _water,
		fanon: _fanon,
		lightson: _lightson
	})
};

var onDataReceived = function(data) {
	_temp = data.temperature !== 'null' ? data.temperature : _temp;
	_hum = data.humidity !== 'null' ? data.humidity : _hum;
	_stat = data.status !== 'null' ? data.status : _stat;
	_distance = data.distance;
	_cur_speed = data.speed != 'null' ? data.speed : 0;
	_cal = Math.floor(_cal_const * _cur_speed);
	console.log(_cal);
	console.log(_cal_const);
	console.log(_cur_speed);
	if(data.speed != 'null') {
		_speed.push({
			speed: data.speed,
			time: normalizeTime(new Date())
		});
	}
	if(data.water != 'null') {
		switch(data.water) {
			case 12:
				_water = 3;
				break;
			case 14:
				_water = 4;
				break;
			case 15:
				_water = 5;
				break;
			case 8:
				_water = 2;
				break;
			case 0:
				_water = 1;
				break;
		}
	}
	_fanon = data.fanon;
	_lightson = data.lightson;
};

var ioConnectionHandler = function(socket) {
	socket.emit('connected');
	socket.on('dataTransfer', onDataReceived);
	_socket = socket;
};

var feedHamster = function(req, res) {
	_socket.emit('feedhamster');
	var hamsterfed = function() {
		_socket.removeListener('hamsterfed', hamsterfed);
		_socket.removeListener('feedingfailed', feedingfailed);
		res.send('ok');
	};
	var feedingfailed = function() {
		res.setHeaders(500, {
			'Content-Type': 'text.plain'
		});
		res.write('Failed to connect to hardware');
		_socket.removeListener('hamsterfed', hamsterfed);
		_socket.removeListener('feedingfailed', feedingfailed);
	};
	_socket.on('hamsterfed', hamsterfed);
	_socket.on('feedingfailed', feedingfailed)
};

var toggleLights = function(req, res) {
	_socket.emit('togglelights');
	var lightstoggled = function() {
		_socket.removeListener('lightstoggled', lightstoggled);
		_socket.removeListener('lightsfailed', lightsfailed);
		res.send('ok');
	};
	var lightsfailed = function() {
		res.setHeaders(500, {
			'Content-Type': 'text.plain'
		});
		res.write('Failed to connect to hardware');
		_socket.removeListener('lightstoggled', lightstoggled);
		_socket.removeListener('lightsfailed', lightsfailed);
	};
	_socket.on('lightstoggled', lightstoggled);
	_socket.on('lightsfailed', lightsfailed);
};

var toggleFan = function(req, res) {
	_socket.emit('togglefan');
	var fantoggled = function() {
		_socket.removeListener('fantoggled', fantoggled);
		_socket.removeListener('fanfailed', fanfailed);
		res.send('ok');
	};
	var fanfailed = function() {
		res.setHeaders(500, {
			'Content-Type': 'text.plain'
		});
		res.write('Failed to connect to hardware');
		_socket.removeListener('fantoggled', fantoggled);
		_socket.removeListener('fanfailed', fanfailed);
	};
	_socket.on('fantoggled', fantoggled);
	_socket.on('fanfailed', fanfailed);
};

var checkTokens = function(req, res, next) {
	console.log(req.headers);
	next();
};

module.exports = {
	initial: initial,
	generalData: generalData,
	ioConnectionHandler: ioConnectionHandler,
	feedHamster: feedHamster,
	toggleLights: toggleLights,
	toggleFan: toggleFan,
	checkTokens: checkTokens
};