var url = require('url');
var promise = require('promise');
var fs = require('fs');
var request = require('request');
var Promise = require("promise");
var ejs = require('ejs');
var io = require('socket.io');

var init = function(req, res) {
	res.send('Server Works');
};

module.exports = {
	init: init
};