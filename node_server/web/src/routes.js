var express = require('express')
    , http = require('http')
    , site = require('./routes/site')
    , passport = require('passport');

module.exports = function(app, io) {

    // GET listeners
	app.get('/', site.checkTokens, site.initial);
    app.get('/api/v1/getGeneralData', site.generalData);

    // POST Listeners

    app.post('/feedhamster', site.checkTokens, site.feedHamster);
    app.post('/togglelights', site.checkTokens, site.toggleLights);
    app.post('/togglefan', site.checkTokens, site.toggleFan);

    io.on('connection', site.ioConnectionHandler)
};