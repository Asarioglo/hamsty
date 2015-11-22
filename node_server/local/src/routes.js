var express = require('express')
    , http = require('http')
    , site = require('./routes/site')
    , passport = require('passport');

module.exports = function(app) {
	app.get('/', site.init);
};